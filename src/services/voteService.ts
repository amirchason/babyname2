/**
 * Vote Service
 * Handles all voting-related Firebase operations
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  runTransaction,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NameEntry } from './nameService';
import { getVoterId } from '../utils/voterIdGenerator';

// TypeScript Interfaces

export interface VoteNameEntry {
  name: string;
  meaning?: string;
  origin?: string;
  gender?: {
    Male?: number;
    Female?: number;
  };
}

export interface VoteCount {
  count: number;
  voters: string[];
}

export type VoteType = 'single' | 'multiple';
export type VoteStatus = 'active' | 'expired' | 'closed';

export interface VoteSession {
  id: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  title: string;
  description?: string;
  names: VoteNameEntry[];
  voteType: VoteType;
  maxVotes: number;
  isPublic: boolean;
  expiresAt: Timestamp | null;
  status: VoteStatus;
  votes: Record<string, VoteCount>;
  totalVoters: number;
  stats: {
    totalVotesCast: number;
    lastVoteAt: Timestamp | null;
  };
}

export interface CreateVoteData {
  title: string;
  description?: string;
  names: VoteNameEntry[];
  voteType: VoteType;
  maxVotes: number;
  isPublic: boolean;
  expiresAt: Date | null;
}

export interface VoteSubmission {
  voteId: string;
  selectedNames: string[];
  voterId: string;
}

export interface VoteResult {
  name: string;
  count: number;
  percentage: number;
  rank: number;
}

// Service Class

class VoteService {
  private collectionName = 'votes';

  /**
   * Create a new vote session
   */
  async createVote(
    userId: string,
    userName: string,
    voteData: CreateVoteData
  ): Promise<string> {
    try {
      // Validation
      if (!voteData.title || voteData.title.trim().length === 0) {
        throw new Error('Title is required');
      }
      if (voteData.title.length > 100) {
        throw new Error('Title must be 100 characters or less');
      }
      if (voteData.description && voteData.description.length > 500) {
        throw new Error('Description must be 500 characters or less');
      }
      if (voteData.names.length < 2) {
        throw new Error('At least 2 names are required');
      }
      if (voteData.names.length > 50) {
        throw new Error('Maximum 50 names allowed');
      }
      if (voteData.maxVotes > voteData.names.length) {
        throw new Error('Max votes cannot exceed number of names');
      }

      // Generate vote ID
      const voteRef = doc(collection(db, this.collectionName));
      const voteId = voteRef.id;

      // Initialize votes object
      const votes: Record<string, VoteCount> = {};
      voteData.names.forEach(nameEntry => {
        votes[nameEntry.name] = {
          count: 0,
          voters: []
        };
      });

      // Create vote session
      const voteSession: Omit<VoteSession, 'id'> = {
        createdBy: userId,
        createdByName: userName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        title: voteData.title.trim(),
        description: voteData.description?.trim() || '',
        names: voteData.names,
        voteType: voteData.voteType,
        maxVotes: voteData.maxVotes,
        isPublic: voteData.isPublic,
        expiresAt: voteData.expiresAt ? Timestamp.fromDate(voteData.expiresAt) : null,
        status: 'active' as VoteStatus,
        votes,
        totalVoters: 0,
        stats: {
          totalVotesCast: 0,
          lastVoteAt: null
        }
      };

      await setDoc(voteRef, voteSession);

      return voteId;
    } catch (error) {
      console.error('Error creating vote:', error);
      throw error;
    }
  }

  /**
   * Get vote session by ID
   */
  async getVote(voteId: string): Promise<VoteSession | null> {
    try {
      const voteRef = doc(db, this.collectionName, voteId);
      const voteSnap = await getDoc(voteRef);

      if (!voteSnap.exists()) {
        return null;
      }

      const data = voteSnap.data();

      // Check if vote has expired
      if (data.expiresAt && data.expiresAt.toDate() < new Date() && data.status === 'active') {
        // Update status to expired
        await updateDoc(voteRef, { status: 'expired' });
        data.status = 'expired';
      }

      return {
        id: voteSnap.id,
        ...data
      } as VoteSession;
    } catch (error) {
      console.error('Error getting vote:', error);
      throw error;
    }
  }

  /**
   * Submit a vote using Firestore transaction
   */
  async submitVote(submission: VoteSubmission): Promise<void> {
    try {
      const { voteId, selectedNames, voterId } = submission;

      const voteRef = doc(db, this.collectionName, voteId);

      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);

        if (!voteDoc.exists()) {
          throw new Error('Vote not found');
        }

        const voteData = voteDoc.data() as Omit<VoteSession, 'id'>;

        // Check if vote is still active
        if (voteData.status !== 'active') {
          throw new Error('This vote is no longer active');
        }

        // Check expiration
        if (voteData.expiresAt && voteData.expiresAt.toDate() < new Date()) {
          throw new Error('This vote has expired');
        }

        // Validate number of selections
        if (selectedNames.length > voteData.maxVotes) {
          throw new Error(`You can only vote for ${voteData.maxVotes} name(s)`);
        }

        if (selectedNames.length === 0) {
          throw new Error('Please select at least one name');
        }

        // Create a copy of votes
        const votes = { ...voteData.votes };

        // Check if user has already voted
        const hasVotedBefore = Object.values(votes).some(
          v => v.voters?.includes(voterId)
        );

        let isNewVoter = !hasVotedBefore;

        // Remove previous votes if user has voted before
        if (hasVotedBefore) {
          Object.keys(votes).forEach(name => {
            if (votes[name].voters.includes(voterId)) {
              votes[name].voters = votes[name].voters.filter(id => id !== voterId);
              votes[name].count = votes[name].voters.length;
            }
          });
        }

        // Add new votes
        selectedNames.forEach(name => {
          if (!votes[name]) {
            votes[name] = { count: 0, voters: [] };
          }
          if (!votes[name].voters.includes(voterId)) {
            votes[name].voters.push(voterId);
            votes[name].count = votes[name].voters.length;
          }
        });

        // Update vote document
        transaction.update(voteRef, {
          votes,
          totalVoters: isNewVoter ? voteData.totalVoters + 1 : voteData.totalVoters,
          'stats.totalVotesCast': voteData.stats.totalVotesCast + selectedNames.length,
          'stats.lastVoteAt': Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  /**
   * Get vote results sorted by count
   */
  async getResults(voteId: string): Promise<VoteResult[]> {
    try {
      const voteSession = await this.getVote(voteId);

      if (!voteSession) {
        throw new Error('Vote not found');
      }

      const results: VoteResult[] = [];
      const totalVotes = Object.values(voteSession.votes).reduce(
        (sum, v) => sum + v.count,
        0
      );

      Object.entries(voteSession.votes).forEach(([name, voteCount]) => {
        results.push({
          name,
          count: voteCount.count,
          percentage: totalVotes > 0 ? (voteCount.count / totalVotes) * 100 : 0,
          rank: 0 // Will be set after sorting
        });
      });

      // Sort by count (descending)
      results.sort((a, b) => b.count - a.count);

      // Assign ranks
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      return results;
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }

  /**
   * Get user's votes
   */
  async getUserVotes(userId: string): Promise<VoteSession[]> {
    try {
      const votesRef = collection(db, this.collectionName);
      const q = query(votesRef, where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);

      const votes: VoteSession[] = [];
      querySnapshot.forEach((doc) => {
        votes.push({
          id: doc.id,
          ...doc.data()
        } as VoteSession);
      });

      return votes;
    } catch (error) {
      console.error('Error getting user votes:', error);
      throw error;
    }
  }

  /**
   * Delete a vote session (only by creator)
   */
  async deleteVote(voteId: string, userId: string): Promise<void> {
    try {
      const voteRef = doc(db, this.collectionName, voteId);
      const voteSnap = await getDoc(voteRef);

      if (!voteSnap.exists()) {
        throw new Error('Vote not found');
      }

      const voteData = voteSnap.data();
      if (voteData.createdBy !== userId) {
        throw new Error('Only the creator can delete this vote');
      }

      await deleteDoc(voteRef);
    } catch (error) {
      console.error('Error deleting vote:', error);
      throw error;
    }
  }

  /**
   * Close a vote (prevent further voting)
   */
  async closeVote(voteId: string, userId: string): Promise<void> {
    try {
      const voteRef = doc(db, this.collectionName, voteId);
      const voteSnap = await getDoc(voteRef);

      if (!voteSnap.exists()) {
        throw new Error('Vote not found');
      }

      const voteData = voteSnap.data();
      if (voteData.createdBy !== userId) {
        throw new Error('Only the creator can close this vote');
      }

      await updateDoc(voteRef, {
        status: 'closed',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error closing vote:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time vote updates
   */
  subscribeToVote(
    voteId: string,
    callback: (voteSession: VoteSession | null) => void
  ): () => void {
    const voteRef = doc(db, this.collectionName, voteId);

    const unsubscribe = onSnapshot(
      voteRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({
            id: snapshot.id,
            ...snapshot.data()
          } as VoteSession);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to vote updates:', error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  /**
   * Check if user has voted in a session
   */
  async hasUserVoted(voteId: string, voterId: string): Promise<boolean> {
    try {
      const voteSession = await this.getVote(voteId);

      if (!voteSession) {
        return false;
      }

      return Object.values(voteSession.votes).some(
        v => v.voters?.includes(voterId)
      );
    } catch (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }
  }

  /**
   * Get user's selected names in a vote session
   */
  async getUserSelection(voteId: string, voterId: string): Promise<string[]> {
    try {
      const voteSession = await this.getVote(voteId);

      if (!voteSession) {
        return [];
      }

      const selectedNames: string[] = [];
      Object.entries(voteSession.votes).forEach(([name, voteCount]) => {
        if (voteCount.voters.includes(voterId)) {
          selectedNames.push(name);
        }
      });

      return selectedNames;
    } catch (error) {
      console.error('Error getting user selection:', error);
      return [];
    }
  }
}

// Export singleton instance
const voteService = new VoteService();
export default voteService;
