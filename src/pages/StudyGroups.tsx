/**
 * Study Groups Page
 * Main page for study groups feature
 * Requirements: 5.2, 5.3
 */

import React, { useState } from 'react';
import { StudyGroupList } from '@/components/study-groups/StudyGroupList';
import { StudyGroupDetail } from '@/components/study-groups/StudyGroupDetail';
import { CreateStudyGroupDialog } from '@/components/study-groups/CreateStudyGroupDialog';
import { StudyGroupWithMembers } from '@/types/study-group';

export const StudyGroups: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupWithMembers | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectGroup = (group: StudyGroupWithMembers) => {
    setSelectedGroup(group);
  };

  const handleBack = () => {
    setSelectedGroup(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {selectedGroup ? (
        <StudyGroupDetail
          groupId={selectedGroup.id}
          onBack={handleBack}
        />
      ) : (
        <StudyGroupList
          key={refreshKey}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setIsCreating(true)}
        />
      )}

      <CreateStudyGroupDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default StudyGroups;
