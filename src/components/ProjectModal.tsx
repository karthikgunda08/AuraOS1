// src/components/ProjectModal.tsx
import React, { useState } from 'react';
import { useAppStore } from '../state/appStore';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const newProject = useAppStore(state => state.newProject);
  const [projectType, setProjectType] = useState<'building' | 'masterPlan'>('building');

  const handleCreate = () => {
    newProject(projectType);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Create a New Project</ModalTitle>
      </ModalHeader>
      <ModalContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
            Choose the type of project you want to start. You can design a single building or a large-scale master plan.
        </p>
        <div className="flex gap-4">
            <button 
                onClick={() => setProjectType('building')}
                className={`flex-1 p-6 rounded-lg border-2 text-left transition-all ${projectType === 'building' ? 'border-sky-500 bg-sky-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            >
                <div className="text-4xl mb-2">🏢</div>
                <h4 className="font-bold text-lg text-slate-100">Building Design</h4>
                <p className="text-sm text-slate-400">Design a residential, commercial, or mixed-use building.</p>
            </button>
             <button 
                onClick={() => setProjectType('masterPlan')}
                className={`flex-1 p-6 rounded-lg border-2 text-left transition-all ${projectType === 'masterPlan' ? 'border-purple-500 bg-purple-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            >
                <div className="text-4xl mb-2">🗺️</div>
                <h4 className="font-bold text-lg text-slate-100">Master Plan</h4>
                <p className="text-sm text-slate-400">Design a community with terrain, zones, and infrastructure.</p>
            </button>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate}>New Project</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectModal;