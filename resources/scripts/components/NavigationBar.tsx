import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCogs,
    faLayerGroup,
    faSignOutAlt,
    faStore,
    faClock,
    faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import styled, { keyframes } from 'styled-components/macro';

const shimmer = keyframes`
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
`;

const NavWrapper = styled.div`
    width: 100%;
    background: #000;
    border-bottom: 1px solid #1a1a1a;
    box-shadow: 0 1px 0 #111, 0 4px 24px rgba(0,0,0,0.6);
    position: sticky;
    top: 0;
    z-index: 100;
    overflow-x: auto;
`;

const Inner = styled.div`
    margin: 0 auto;
    max-width: 1200px;
    display: flex;
    align-items: center;
    height: 3.5rem;
`;

const Logo = styled(Link)`
    flex: 1;
    padding: 0 1rem;
    text-decoration: none;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: linear-gradient(90deg, #fff 0%, #888 40%, #fff 60%, #888 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
    transition: opacity 0.2s;

    &:hover { opacity: 0.8; }
`;

const KxyBadge = styled(NavLink)`
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 0.75rem;
    text-decoration: none;
    color: #a78bfa;
    font-size: 0.8rem;
    font-weight: 600;
    gap: 0.3rem;
    transition: color 0.15s;
    white-space: nowrap;

    & span.amount {
        background: rgba(167,139,250,0.12);
        border: 1px solid rgba(167,139,250,0.3);
        border-radius: 20px;
        padding: 2px 8px;
        font-size: 0.75rem;
        transition: background 0.2s;
    }

    &:hover { color: #c4b5fd; }
    &:hover span.amount { background: rgba(167,139,250,0.2); }
`;

const RightNav = styled.div`
    display: flex;
    height: 100%;
    align-items: center;

    & > a,
    & > button,
    & > .navigation-link {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 1.1rem;
        text-decoration: none;
        color: #888;
        cursor: pointer;
        background: none;
        border: none;
        font-size: 0.85rem;
        transition: color 0.15s, background 0.15s;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background: #fff;
            transition: width 0.2s ease;
        }

        &:hover, &:active { color: #fff; }
        &:hover::after, &:active::after, &.active::after { width: 60%; }
        &.active { color: #fff; }
    }
`;

// This would normally come from API — for demo purposes we show a static value
const MOCK_KXY = 1250;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <NavWrapper>
            <SpinnerOverlay visible={isLoggingOut} />
            <Inner>
                <Logo to={'/'}>KROXY</Logo>

                <RightNav>
                    {/* Kxy balance */}
                    <KxyBadge to={'/store'}>
                        ✦ <span className={'amount'}>{MOCK_KXY.toLocaleString()} Kxy</span>
                    </KxyBadge>

                    <SearchContainer />

                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>

                    <Tooltip placement={'bottom'} content={'Create Server'}>
                        <NavLink to={'/create-server'}>
                            <FontAwesomeIcon icon={faPlusCircle} />
                        </NavLink>
                    </Tooltip>

                    <Tooltip placement={'bottom'} content={'Shop'}>
                        <NavLink to={'/store'}>
                            <FontAwesomeIcon icon={faStore} />
                        </NavLink>
                    </Tooltip>

                    <Tooltip placement={'bottom'} content={'AFK Farm'}>
                        <NavLink to={'/afk'}>
                            <FontAwesomeIcon icon={faClock} />
                        </NavLink>
                    </Tooltip>

                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}

                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span style={{ display: 'flex', alignItems: 'center', width: 20, height: 20 }}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>

                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNav>
            </Inner>
        </NavWrapper>
    );
};
