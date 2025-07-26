// src/components/guilds/GuildsView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, BrahmanTierProject, Guild } from '../../types';

const MotionDiv = motion.div as any;

// Mock data for demonstration
const mockGuilds: Guild[] = [
  {
    id: 'guild_1',
    name: 'The Vastu Visionaries',
    members: [{ name: 'A. Sharma' }, { name: 'P. Rao' }, { name: 'S. Khan' }] as User[],
    activeProject: {
      id: 'proj_brahman_1',
      title: 'Himalayan Wellness Retreat',
      description: 'A luxury sustainable retreat integrating advanced Vastu principles.',
      budget: 'High',
      timeline: '18 Months',
      requiredSkills: ['Vastu', 'Sustainable Design', 'Luxury Hospitality']
    }
  },
  {
    id: 'guild_2',
    name: 'Urban Futurists',
    members: [{ name: 'R. Chen' }, { name: 'M. Adebayo' }, { name: 'L. Gomez' }] as User[],
    activeProject: {
      id: 'proj_brahman_2',
      title: 'Mumbai Arcology Prototype',
      description: 'A self-sustaining vertical city concept for dense urban environments.',
      budget: 'Very High',
      timeline: '36 Months',
      requiredSkills: ['Master Planning', 'Parametric Design', 'Structural Engineering']
    }
  }
];

const mockAvailableProjects: BrahmanTierProject[] = [
  {
    id: 'proj_brahman_3',
    title: 'Ganges Riverfront Rejuvenation',
    description: 'A large-scale urban and ecological renewal project in Varanasi.',
    budget: 'National Scale',
    timeline: '5 Years',
    requiredSkills: ['Urban Planning', 'Hydro-Engineering', 'Cultural Heritage']
  },
  {
    id: 'proj_brahman_4',
    title: 'Project Citadel',
    description: 'Design a next-generation, secure data-haven powered by geothermal energy in Iceland.',
    budget: 'Confidential',
    timeline: '24 Months',
    requiredSkills: ['Secure Facilities', 'Sustainable Energy', 'Data Center Architecture']
  }
];

const GuildCard: React.FC<{ guild: Guild }> = ({ guild }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
        <h3 className="text-xl font-bold text-sky-300">{guild.name}</h3>
        <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Active Project</h4>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/50">
                <h5 className="font-semibold text-purple-300">{guild.activeProject?.title}</h5>
                <p className="text-sm text-slate-300">{guild.activeProject?.description}</p>
            </div>
        </div>
        <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Members</h4>
            <div className="flex flex-wrap gap-2">
                {guild.members.map(member => (
                     <span key={member.name} className="px-2 py-1 text-xs bg-slate-700 rounded-md">{member.name}</span>
                ))}
            </div>
        </div>
    </div>
);

const ProjectBountyCard: React.FC<{ project: BrahmanTierProject }> = ({ project }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-3">
        <h3 className="text-xl font-bold text-amber-300">{project.title}</h3>
        <p className="text-sm text-slate-300">{project.description}</p>
        <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map(skill => (
                    <span key={skill} className="px-2 py-1 text-xs bg-slate-700 rounded-md">{skill}</span>
                ))}
            </div>
        </div>
        <button className="w-full mt-4 p-2 font-semibold bg-amber-600 hover:bg-amber-500 rounded-md text-white">
            Form a Guild & Bid
        </button>
    </div>
);


export const GuildsView: React.FC = () => {
    return (
        <div className="flex-grow animated-gradient-bg-studio py-16 md:py-24">
            <MotionDiv
                className="container mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">Architects' Guilds</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">Where elite architects collaborate on Brahman-tier projects that redefine the future.</p>
                </header>
                
                <div className="grid lg:grid-cols-2 gap-12">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Active Guilds</h2>
                        <div className="space-y-6">
                            {mockGuilds.map(guild => (
                                <GuildCard key={guild.id} guild={guild} />
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Available Brahman-Tier Projects</h2>
                         <div className="space-y-6">
                            {mockAvailableProjects.map(project => (
                                <ProjectBountyCard key={project.id} project={project} />
                            ))}
                        </div>
                    </section>
                </div>

            </MotionDiv>
        </div>
    );
};

export default GuildsView;