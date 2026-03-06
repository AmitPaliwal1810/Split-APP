import { Group, GroupMember } from '@types/index';

// Conditionally import Firebase (won't work in Expo Go)
let firestore: any = null;
try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (error) {
  console.warn('⚠️ Firestore not available (Expo Go mode)');
}

const getFirestore = () => {
  if (!firestore) throw new Error('Firestore not available. Requires a development build.');
  return firestore();
};

// Deep sanitize: replace all undefined values with null (Firestore rejects undefined)
const sanitize = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  // Check if it's a Firestore FieldValue (serverTimestamp etc)
  if (obj.constructor && obj.constructor.name !== 'Object') return obj;
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    cleaned[key] = sanitize(obj[key]);
  }
  return cleaned;
};

/**
 * Create a new group
 */
export const createGroup = async (
  name: string,
  description: string,
  category: string,
  creatorId: string,
  creatorName: string,
  creatorPhotoURL?: string
): Promise<string> => {
  const db = getFirestore();

  const groupData = {
    name: (name || '').trim(),
    description: (description || '').trim(),
    category: category || 'other',
    createdBy: creatorId,
    memberIds: [creatorId], // flat array for querying
    members: [
      {
        userId: creatorId,
        displayName: creatorName || 'User',
        photoURL: creatorPhotoURL || null,
        addedAt: new Date(),
        balance: 0,
      },
    ],
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('groups').add(sanitize(groupData));
  return docRef.id;
};

/**
 * Get a group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  const db = getFirestore();
  const groupDoc = await db.collection('groups').doc(groupId).get();
  if (groupDoc.exists) {
    return { id: groupDoc.id, ...groupDoc.data() } as Group;
  }
  return null;
};

/**
 * Add a member to a group
 */
export const addGroupMember = async (
  groupId: string,
  userId: string,
  displayName: string,
  photoURL?: string
): Promise<void> => {
  const db = getFirestore();
  const groupRef = db.collection('groups').doc(groupId);

  const member = {
    userId,
    displayName: displayName || 'User',
    photoURL: photoURL || null,
    addedAt: new Date(),
    balance: 0,
  };

  // Get current group to check if already a member
  const groupDoc = await groupRef.get();
  if (!groupDoc.exists) throw new Error('Group not found');

  const group = groupDoc.data();
  const existingMemberIds: string[] = group.memberIds || [];
  if (existingMemberIds.includes(userId)) {
    throw new Error('User is already a member of this group');
  }

  // Add to both members array and memberIds array
  const updatedMembers = [...(group.members || []), member];
  const updatedMemberIds = [...existingMemberIds, userId];

  await groupRef.update(sanitize({
    members: updatedMembers,
    memberIds: updatedMemberIds,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  }));
};

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  const db = getFirestore();
  const groupRef = db.collection('groups').doc(groupId);

  const groupDoc = await groupRef.get();
  if (!groupDoc.exists) throw new Error('Group not found');

  const group = groupDoc.data();
  const updatedMembers = (group.members || []).filter(
    (m: GroupMember) => m.userId !== userId
  );
  const updatedMemberIds = (group.memberIds || []).filter(
    (id: string) => id !== userId
  );

  await groupRef.update({
    members: updatedMembers,
    memberIds: updatedMemberIds,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Delete a group and its expenses
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  const db = getFirestore();
  await db.collection('groups').doc(groupId).delete();

  // Also delete expenses from Realtime DB
  try {
    const database = require('@react-native-firebase/database').default;
    await database().ref(`expenses/${groupId}`).remove();
  } catch (e) {
    console.warn('Could not delete expenses:', e);
  }
};

/**
 * Update member balances after an expense is added
 */
export const updateMemberBalances = async (
  groupId: string,
  paidByUserId: string,
  amount: number,
  splits: { userId: string; amount: number }[]
): Promise<void> => {
  const db = getFirestore();
  const groupRef = db.collection('groups').doc(groupId);

  const groupDoc = await groupRef.get();
  if (!groupDoc.exists) throw new Error('Group not found');

  const group = groupDoc.data();
  const updatedMembers = (group.members || []).map((member: GroupMember) => {
    const split = splits.find((s) => s.userId === member.userId);
    if (!split) return member;

    if (member.userId === paidByUserId) {
      // Payer is owed (amount - their share)
      return { ...member, balance: member.balance + (amount - split.amount) };
    } else {
      // Others owe their split amount
      return { ...member, balance: member.balance - split.amount };
    }
  });

  await groupRef.update(sanitize({
    members: updatedMembers,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  }));
};
