import type React from 'react';
import { useEffect, useState } from 'react';
import type MudClient from '../client';
import { useSkillsStore } from '../stores/skillsStore';
import './SkillsDisplay.css'; // We'll create this CSS file next

interface SkillsDisplayProps {
    client: MudClient;
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ client }) => {
    const groups = useSkillsStore((state) => state.groups);
    const skillsData = useSkillsStore((state) => state.skillsByGroup);
    const setGroupLoading = useSkillsStore((state) => state.setGroupLoading);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const charSkillsHandler = client.gmcp.handlers['Char.Skills'];

    // --- Component Logic ---
    const toggleGroup = (groupName: string) => {
        const newExpandedGroup = expandedGroup === groupName ? null : groupName;
        setExpandedGroup(newExpandedGroup);

        // Fetch skills for the group if it's being expanded and not already loaded/loading
        if (newExpandedGroup === groupName && !skillsData[groupName]?.list && !skillsData[groupName]?.isLoading) {
            if (charSkillsHandler) {
                setGroupLoading(groupName);
                charSkillsHandler.sendGet({ group: groupName });
            } else {
                console.warn("Char.Skills handler not found.");
            }
        }
    };

    useEffect(() => {
        // Request initial skill groups when component mounts
        if (charSkillsHandler) {
            console.log("Requesting initial skill groups...");
            charSkillsHandler.sendGet({});
        } else {
            console.warn("Char.Skills handler not found.");
        }
    }, [charSkillsHandler]);

    const headingId = "skills-heading";

    return (
        <div className="skills-display" role="region" aria-labelledby={headingId}>
            <h4 id={headingId}>Skills</h4>
            {groups.length === 0 ? (
                <p>No skill groups available.</p>
            ) : (
                <div className="skill-accordion">
                    {groups.map((group, index) => {
                        const isExpanded = expandedGroup === group.name;
                        const panelId = `skill-panel-${index}`;
                        const headerId = `skill-header-${index}`;
                        const skills = skillsData[group.name];

                        return (
                            <div key={group.name} className="skill-group">
                                <h5>
                                    <button
                                        type="button"
                                        id={headerId}
                                        aria-expanded={isExpanded}
                                        aria-controls={panelId}
                                        onClick={() => toggleGroup(group.name)}
                                        className="skill-group-header"
                                    >
                                        {group.name} <span className="skill-rank">({group.rank})</span>
                                        <span className="accordion-icon" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                                    </button>
                                </h5>
                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={headerId}
                                    hidden={!isExpanded}
                                    className="skill-list-panel"
                                >
                                    {skills?.isLoading ? (
                                        <p>Loading skills...</p>
                                    ) : skills?.list && skills.list.length > 0 ? (
                                        <ul aria-label={`Skills in ${group.name}`}>
                                            {skills.list.map((skillName, skillIndex) => (
                                                <li key={skillName} title={skills.descs?.[skillIndex]}>
                                                    {skillName}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No skills listed for this group.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SkillsDisplay;
