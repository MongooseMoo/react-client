import React, { useState, useEffect, useCallback } from 'react';
import MudClient from '../client';
import { SkillGroupInfo, GMCPMessageCharSkillsList } from '../gmcp/Char/Skills';
import './SkillsDisplay.css'; // We'll create this CSS file next

interface SkillsDisplayProps {
    client: MudClient;
}

interface SkillDetails extends GMCPMessageCharSkillsList {
    isLoading?: boolean;
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ client }) => {
    const [groups, setGroups] = useState<SkillGroupInfo[]>([]);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [skillsData, setSkillsData] = useState<{ [groupName: string]: SkillDetails }>({});

    const charSkillsHandler = client.gmcpHandlers['Char.Skills'] as any; // Cast for method access

    // --- Handlers for GMCP Messages ---
    const handleGroups = useCallback((groupList: SkillGroupInfo[]) => {
        setGroups(groupList);
        client.emit('skillsDataReceived'); // Signal data received for sidebar tab
    }, [client]);

    const handleList = useCallback((data: GMCPMessageCharSkillsList) => {
        setSkillsData(prev => ({
            ...prev,
            [data.group]: { ...data, isLoading: false }
        }));
    }, []);

    // --- Component Logic ---
    const toggleGroup = (groupName: string) => {
        const newExpandedGroup = expandedGroup === groupName ? null : groupName;
        setExpandedGroup(newExpandedGroup);

        // Fetch skills for the group if it's being expanded and not already loaded/loading
        if (newExpandedGroup === groupName && !skillsData[groupName]?.list && !skillsData[groupName]?.isLoading) {
            if (charSkillsHandler?.sendGetRequest) {
                setSkillsData(prev => ({ ...prev, [groupName]: { group: groupName, list: [], isLoading: true } }));
                charSkillsHandler.sendGetRequest(groupName);
            } else {
                console.warn("Char.Skills handler or sendGetRequest method not found.");
            }
        }
    };

    useEffect(() => {
        client.on('skillGroups', handleGroups);
        client.on('skillList', handleList);

        // Request initial skill groups when component mounts
        if (charSkillsHandler?.sendGetRequest) {
            console.log("Requesting initial skill groups...");
            charSkillsHandler.sendGetRequest(); // Request groups (no args)
        } else {
            console.warn("Char.Skills handler or sendGetRequest method not found.");
        }

        return () => {
            client.off('skillGroups', handleGroups);
            client.off('skillList', handleList);
        };
    }, [client, handleGroups, handleList, charSkillsHandler]);

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
