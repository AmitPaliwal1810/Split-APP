import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';
import { Group, GroupMember } from '@types/index';

/**
 * Create a new group
 */
export const createGroup = async (
  name: string,
  description: string,
  creatorId: string,
  creatorName: string,
  creatorPhotoURL?: string
): Promise<string> => {
  try {
    const groupData = {
      name: name.trim(),
      description: description.trim(),
      createdBy: creatorId,
      members: [
        {
          userId: creatorId,
          displayName: creatorName,
          photoURL: creatorPhotoURL,
          addedAt: new Date(),
          balance: 0,
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Failed to create group: ${error.message}`);
  }
};

/**
 * Get a group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() } as Group;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get group: ${error.message}`);
  }
};

/**
 * Get all groups for a user
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', { userId })
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Group[];
  } catch (error: any) {
    throw new Error(`Failed to get user groups: ${error.message}`);
  }
};

/**
 * Update group details
 */
export const updateGroup = async (
  groupId: string,
  updates: Partial<Group>
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update group: ${error.message}`);
  }
};

/**
 * Add a member to a group
 */
export const addGroupMember = async (
  groupId: string,
  member: GroupMember
): Promise<void> => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(member),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to add member: ${error.message}`);
  }
};

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');

    const member = group.members.find((m) => m.userId === userId);
    if (!member) throw new Error('Member not found');

    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(member),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (error: any) {
    throw new Error(`Failed to delete group: ${error.message}`);
  }
};

/**
 * Update member balance in a group
 */
export const updateMemberBalance = async (
  groupId: string,
  userId: string,
  balanceChange: number
): Promise<void> => {
  try {
    const group = await getGroup(groupId);
    if (!group) throw new Error('Group not found');

    const updatedMembers = group.members.map((member) => {
      if (member.userId === userId) {
        return {
          ...member,
          balance: member.balance + balanceChange,
        };
      }
      return member;
    });

    await updateGroup(groupId, { members: updatedMembers });
  } catch (error: any) {
    throw new Error(`Failed to update balance: ${error.message}`);
  }
};
