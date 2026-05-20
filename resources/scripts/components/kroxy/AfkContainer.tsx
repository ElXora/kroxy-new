import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import styled, { keyframes, css } from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faPlay,
    faStop,
    faStar,
    faHistory,
    faBolt,
} from '@fortawesome/free-solid-svg-icons';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.5}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const countUp = keyframes`from{transform:translateY(4px);opacity:0}to{transform:translateY(0);opacity:1}`;
const particleFloat = keyframes`
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
`;

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

const MainCard = styled.div`
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 12px;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    animation: ${fadeIn} 0.3s ease both;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 1.5rem;
`;

const OrbWrapper = styled.div<{ active: boolean }>`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;

    ${({ active }) => active && css`
        &::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: #fff;
            border-right-color: #fff;
            animation: ${spin} 1.5s linear infinite;
        }
    `}

    &:hover { transform: scale(1.04); }
    &:active { transform: scale(0.97); }
`;

const Orb = styled.div<{ active: boolean }>`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ active }) => active ? '#111' : '#0a0a0a'};
    border: 1px solid ${({ active }) => active ? '#333' : '#1a1a1a'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    color: ${({ active }) => active ? '#a78bfa' : '#333'};
    box-shadow: ${({ active }) => active ? '0 0 30px rgba(167,139,250,0.15), inset 0 0 20px rgba(167,139,250,0.05)' : 'none'};
    transition: all 0.3s;

    ${({ active }) => active && css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const TimerDisplay = styled.div`
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    animation: ${countUp} 0.2s ease both;
    line-height: 1;
`;

const RateDisplay = styled.div<{ active: boolean }>`
    font-size: 0.8rem;
    color: ${({ active }) => active ? '#a78bfa' : '#333'};
    letter-spacing: 0.05em;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const EarnedBadge = styled.div`
    background: rgba(167,139,250,0.1);
    border: 1px solid rgba(167,139,250,0.25);
    border-radius: 20px;
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const ControlBtn = styled.button<{ variant: 'start' | 'stop' }>`
    padding: 0.75rem 2.5rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    ${({ variant }) => variant === 'start' ? css`
        background: #fff;
        color: #000;
        &:hover { background: #e0e0e0; transform: translateY(-1px); }
    ` : css`
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.25);
        color: #ef4444;
        &:hover { background: rgba(239,68,68,0.15); transform: translateY(-1px); }
    `}

    &:active { transform: translateY(0); }
`;

const Particle = styled.div<{ x: number; delay: number }>`
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    left: ${({ x }) => x}%;
    bottom: 30%;
    animation: ${particleFloat} 1.5s ease-out ${({ delay }) => delay}s both;
    pointer-events: none;
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    width: 100%;

    @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StatBox = styled.div`
    background: #000;
    border: 1px solid #111;
    border-radius: 8px;
    padding: 0.9rem;
    text-align: center;

    .val { font-size: 1.1rem; font-weight: 700; color: #ddd; }
    .lbl { font-size: 0.68rem; color: #444; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }
`;

const InfoCard = styled.div`
    background: #0a0a0a;
    border: 1px solid #111;
    border-radius: 10px;
    padding: 1.3rem;
    animation: ${fadeIn} 0.4s ease both;
`;

const InfoTitle = styled.div`
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const RateTable = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const RateRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.7rem;
    background: #000;
    border: 1px solid #111;
    border-radius: 6px;
    font-size: 0.82rem;

    .label { color: #666; }
    .rate  { color: #a78bfa; font-weight: 600; }
`;

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

const KXY_PER_MINUTE = 5;

export default () => {
    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [sessionEarned, setSessionEarned] = useState(0);
    const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const particleId = useRef(0);

    const addParticles = useCallback(() => {
        const newParticles = Array.from({ length: 3 }, (_, i) => ({
            id: particleId.current++,
            x: 35 + Math.random() * 30,
            delay: i * 0.1,
        }));
        setParticles((p) => [...p, ...newParticles]);
        setTimeout(() => {
            setParticles((p) => p.filter((pt) => !newParticles.find((np) => np.id === pt.id)));
        }, 2000);
    }, []);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setElapsed((e) => e + 1);
                setSessionEarned((se) => {
                    const newVal = se + KXY_PER_MINUTE / 60;
                    if (Math.floor(newVal) > Math.floor(se)) {
                        setTotalEarned((t) => t + 1);
                        addParticles();
                    }
                    return newVal;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isActive]);

    const start = () => {
        setIsActive(true);
        setSessionEarned(0);
    };

    const stop = () => {
        setIsActive(false);
        setElapsed(0);
        setSessionEarned(0);
    };

    return (
        <PageContentBlock title={'AFK Farm'}>
            <Header>
                <h1><FontAwesomeIcon icon={faClock} style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} /> AFK Farm</h1>
                <p>Stay on this page to earn Kxy currency over time. Use it in the shop to buy resources!</p>
            </Header>

            <MainCard>
                {particles.map((p) => (
                    <Particle key={p.id} x={p.x} delay={p.delay} />
                ))}

                <OrbWrapper active={isActive} onClick={isActive ? stop : start}>
                    <Orb active={isActive}>
                        <FontAwesomeIcon icon={faClock} />
                    </Orb>
                </OrbWrapper>

                <TimerDisplay>{formatTime(elapsed)}</TimerDisplay>

                <RateDisplay active={isActive}>
                    <FontAwesomeIcon icon={faBolt} />
                    {isActive ? `Earning ${KXY_PER_MINUTE} Kxy / min` : 'Click orb to start farming'}
                </RateDisplay>

                <EarnedBadge>
                    <FontAwesomeIcon icon={faStar} />
                    +{Math.floor(sessionEarned)} Kxy this session
                </EarnedBadge>

                <StatsRow>
                    <StatBox>
                        <div className={'val'}>{totalEarned.toLocaleString()}</div>
                        <div className={'lbl'}>Total Earned</div>
                    </StatBox>
                    <StatBox>
                        <div className={'val'}>{Math.floor(elapsed / 60)}m {elapsed % 60}s</div>
                        <div className={'lbl'}>Time Farmed</div>
                    </StatBox>
                    <StatBox>
                        <div className={'val'}>{KXY_PER_MINUTE}</div>
                        <div className={'lbl'}>Kxy / min</div>
                    </StatBox>
                </StatsRow>

                {isActive ? (
                    <ControlBtn variant={'stop'} onClick={stop}>
                        <FontAwesomeIcon icon={faStop} />
                        Stop Farming
                    </ControlBtn>
                ) : (
                    <ControlBtn variant={'start'} onClick={start}>
                        <FontAwesomeIcon icon={faPlay} />
                        Start Farming
                    </ControlBtn>
                )}
            </MainCard>

            <InfoCard>
                <InfoTitle><FontAwesomeIcon icon={faHistory} /> Earning Rates</InfoTitle>
                <RateTable>
                    <RateRow>
                        <span className={'label'}>Base rate</span>
                        <span className={'rate'}>{KXY_PER_MINUTE} Kxy / min</span>
                    </RateRow>
                    <RateRow>
                        <span className={'label'}>1 hour AFK</span>
                        <span className={'rate'}>{KXY_PER_MINUTE * 60} Kxy</span>
                    </RateRow>
                    <RateRow>
                        <span className={'label'}>1 day AFK</span>
                        <span className={'rate'}>{KXY_PER_MINUTE * 60 * 24} Kxy</span>
                    </RateRow>
                    <RateRow>
                        <span className={'label'}>Tab must stay open</span>
                        <span className={'rate'} style={{ color: '#555' }}>Required</span>
                    </RateRow>
                </RateTable>
            </InfoCard>
        </PageContentBlock>
    );
};
