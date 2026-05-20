import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import styled, { keyframes } from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faServer,
    faMemory,
    faMicrochip,
    faHdd,
    faCheckCircle,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.3s ease both;

    h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 0.3rem;
    }
    p { color: #555; font-size: 0.875rem; }
`;

const Card = styled.div`
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.2rem;
    animation: ${fadeIn} 0.35s ease both;
    transition: border-color 0.2s;

    &:hover { border-color: #2a2a2a; }
`;

const CardTitle = styled.h3`
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InputRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;

    @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    label {
        font-size: 0.72rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.07em;
    }

    input, select {
        background: #000;
        border: 1px solid #222;
        border-radius: 6px;
        padding: 0.55rem 0.75rem;
        color: #ddd;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;

        &:focus {
            border-color: #444;
            box-shadow: 0 0 0 2px rgba(255,255,255,0.04);
        }
    }
`;

const EggGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.7rem;
`;

const EggOption = styled.button<{ selected: boolean }>`
    background: ${({ selected }) => selected ? '#1a1a1a' : '#000'};
    border: 1px solid ${({ selected }) => selected ? '#fff' : '#222'};
    border-radius: 8px;
    padding: 0.8rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
    color: ${({ selected }) => selected ? '#fff' : '#666'};

    &:hover { border-color: #444; color: #ccc; }

    .icon { font-size: 1.1rem; margin-bottom: 0.3rem; }
    .name { font-size: 0.8rem; font-weight: 600; }
    .tag  { font-size: 0.68rem; color: #555; margin-top: 0.1rem; }
`;

const SliderRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #666;

        .val { color: #ccc; font-weight: 600; }
    }

    input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, #fff var(--pct, 25%), #1a1a1a var(--pct, 25%));
        border-radius: 999px;
        cursor: pointer;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(255,255,255,0.3);
        }
    }
`;

const SubmitBtn = styled.button`
    width: 100%;
    padding: 0.9rem;
    background: #fff;
    color: #000;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.2s, transform 0.1s;
    margin-top: 1.5rem;

    &:hover { background: #e0e0e0; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
`;

const SuccessBanner = styled.div`
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    animation: ${fadeIn} 0.3s ease both;
    color: #22c55e;
    font-size: 1rem;
    font-weight: 600;
`;

const EGGS = [
    { id: 'minecraft', name: 'Minecraft', icon: '⛏️', tag: 'Java / Bedrock' },
    { id: 'rust',      name: 'Rust',      icon: '🦀', tag: 'Survival' },
    { id: 'csgo',      name: 'CS:GO',     icon: '🎯', tag: 'FPS' },
    { id: 'gmod',      name: "Garry's Mod", icon: '🔧', tag: 'Sandbox' },
    { id: 'ark',       name: 'ARK',       icon: '🦕', tag: 'Survival' },
    { id: 'custom',    name: 'Custom',    icon: '⚙️', tag: 'Bring your own' },
];

export default () => {
    const [serverName, setServerName] = useState('');
    const [selectedEgg, setSelectedEgg] = useState('minecraft');
    const [ram, setRam] = useState(1024);
    const [cpu, setCpu] = useState(100);
    const [disk, setDisk] = useState(5120);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!serverName.trim()) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <PageContentBlock title={'Create Server'}>
                <SuccessBanner>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.5rem' }} />
                    Server "{serverName}" is being provisioned!
                    <p style={{ color: '#555', fontSize: '0.8rem', fontWeight: 400, marginTop: '0.5rem' }}>
                        Your server will appear on the dashboard in a few moments.
                    </p>
                </SuccessBanner>
            </PageContentBlock>
        );
    }

    return (
        <PageContentBlock title={'Create Server'}>
            <Header>
                <h1><FontAwesomeIcon icon={faServer} style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} /> Create Server</h1>
                <p>Deploy a new server using your available resources.</p>
            </Header>

            {/* Basic Info */}
            <Card>
                <CardTitle><FontAwesomeIcon icon={faServer} /> Basic Info</CardTitle>
                <InputRow>
                    <Field>
                        <label>Server Name</label>
                        <input
                            type={'text'}
                            placeholder={'my-awesome-server'}
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <label>Description</label>
                        <input type={'text'} placeholder={'Optional description'} />
                    </Field>
                </InputRow>
            </Card>

            {/* Game / Egg selection */}
            <Card>
                <CardTitle><FontAwesomeIcon icon={faMicrochip} /> Game Type</CardTitle>
                <EggGrid>
                    {EGGS.map((egg) => (
                        <EggOption
                            key={egg.id}
                            selected={selectedEgg === egg.id}
                            onClick={() => setSelectedEgg(egg.id)}
                        >
                            <div className={'icon'}>{egg.icon}</div>
                            <div className={'name'}>{egg.name}</div>
                            <div className={'tag'}>{egg.tag}</div>
                        </EggOption>
                    ))}
                </EggGrid>
            </Card>

            {/* Resources */}
            <Card>
                <CardTitle><FontAwesomeIcon icon={faMemory} /> Resources</CardTitle>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <SliderRow>
                        <div className={'labels'}>
                            <span><FontAwesomeIcon icon={faMemory} style={{ marginRight: '0.4rem' }} />RAM</span>
                            <span className={'val'}>{ram >= 1024 ? `${ram / 1024} GB` : `${ram} MB`}</span>
                        </div>
                        <input
                            type={'range'}
                            min={256}
                            max={8192}
                            step={256}
                            value={ram}
                            style={{ '--pct': `${((ram - 256) / (8192 - 256)) * 100}%` } as React.CSSProperties}
                            onChange={(e) => setRam(Number(e.target.value))}
                        />
                    </SliderRow>

                    <SliderRow>
                        <div className={'labels'}>
                            <span><FontAwesomeIcon icon={faMicrochip} style={{ marginRight: '0.4rem' }} />CPU</span>
                            <span className={'val'}>{cpu}%</span>
                        </div>
                        <input
                            type={'range'}
                            min={10}
                            max={400}
                            step={10}
                            value={cpu}
                            style={{ '--pct': `${((cpu - 10) / (400 - 10)) * 100}%` } as React.CSSProperties}
                            onChange={(e) => setCpu(Number(e.target.value))}
                        />
                    </SliderRow>

                    <SliderRow>
                        <div className={'labels'}>
                            <span><FontAwesomeIcon icon={faHdd} style={{ marginRight: '0.4rem' }} />Disk</span>
                            <span className={'val'}>{disk >= 1024 ? `${(disk / 1024).toFixed(0)} GB` : `${disk} MB`}</span>
                        </div>
                        <input
                            type={'range'}
                            min={1024}
                            max={51200}
                            step={1024}
                            value={disk}
                            style={{ '--pct': `${((disk - 1024) / (51200 - 1024)) * 100}%` } as React.CSSProperties}
                            onChange={(e) => setDisk(Number(e.target.value))}
                        />
                    </SliderRow>
                </div>
            </Card>

            <SubmitBtn onClick={handleSubmit}>
                <FontAwesomeIcon icon={faChevronRight} />
                Deploy Server
            </SubmitBtn>
        </PageContentBlock>
    );
};
