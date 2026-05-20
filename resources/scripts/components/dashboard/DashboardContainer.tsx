import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';

/* ── animations ─────────────────────────────────────── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const fillBar = keyframes`from{width:0}`;

/* ── styled components ───────────────────────────────── */
const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.4s ease both;
`;

const ResourceCard = styled.div`
    background: #0d0d0d;
    border: 1px solid #1a1a1a;
    border-radius: 10px;
    padding: 1.1rem 1.3rem;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: #2a2a2a;
        box-shadow: 0 0 20px rgba(255,255,255,0.04);
    }
`;

const ResourceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    font-size: 0.78rem;
    color: #777;
    text-transform: uppercase;
    letter-spacing: 0.08em;

    & span.used {
        color: #ccc;
        font-weight: 600;
    }
`;

const BarTrack = styled.div`
    width: 100%;
    height: 6px;
    background: #1a1a1a;
    border-radius: 999px;
    overflow: hidden;
`;

const BarFill = styled.div<{ pct: number; color: string }>`
    height: 100%;
    border-radius: 999px;
    width: ${({ pct }) => pct}%;
    background: ${({ color }) => color};
    animation: ${fillBar} 0.8s cubic-bezier(0.4,0,0.2,1) both;
    box-shadow: ${({ color }) => `0 0 6px ${color}66`};
`;

const SectionTitle = styled.h2`
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #111;
`;

const AdminToggleBar = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
    font-size: 0.72rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.07em;
`;

/* ── resource bar colour logic ───────────────────────── */
function barColor(pct: number): string {
    if (pct < 50) return '#22c55e';
    if (pct < 80) return '#eab308';
    return '#ef4444';
}

interface ResourceStat {
    label: string;
    used: string;
    total: string;
    pct: number;
}

/* Mock resource data — replace with real API calls in production */
function useMockResources(): ResourceStat[] {
    return [
        { label: 'RAM',          used: '4 GB',   total: '16 GB', pct: 25 },
        { label: 'CPU',          used: '1.2 vCPU', total: '4 vCPU', pct: 30 },
        { label: 'Disk',         used: '18 GB',  total: '100 GB', pct: 18 },
        { label: 'Server Slots', used: '2',      total: '5',     pct: 40 },
    ];
}

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const resources = useMockResources();

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => { setPage(1); }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) setPage(1);
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {/* Resource usage bars */}
            <SectionTitle>Resource Usage</SectionTitle>
            <ResourceGrid>
                {resources.map((r) => (
                    <ResourceCard key={r.label}>
                        <ResourceLabel>
                            <span>{r.label}</span>
                            <span className={'used'}>{r.used} / {r.total}</span>
                        </ResourceLabel>
                        <BarTrack>
                            <BarFill pct={r.pct} color={barColor(r.pct)} />
                        </BarTrack>
                    </ResourceCard>
                ))}
            </ResourceGrid>

            {/* Server list */}
            <SectionTitle>Your Servers</SectionTitle>

            {rootAdmin && (
                <AdminToggleBar>
                    <span>{showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}</span>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin((s) => !s)}
                    />
                </AdminToggleBar>
            )}

            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            items.map((server, index) => (
                                <ServerRow
                                    key={server.uuid}
                                    server={server}
                                    style={{ marginTop: index > 0 ? '0.5rem' : undefined }}
                                />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#555', padding: '3rem 0' }}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'No servers yet. Create one to get started!'}
                            </p>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
