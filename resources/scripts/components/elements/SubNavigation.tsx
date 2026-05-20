import styled from 'styled-components/macro';

const SubNavigation = styled.div`
    width: 100%;
    background: #050505;
    border-bottom: 1px solid #111;
    overflow-x: auto;

    & > div {
        display: flex;
        align-items: center;
        font-size: 0.8rem;
        margin: 0 auto;
        padding: 0 0.5rem;
        max-width: 1200px;

        & > a,
        & > div {
            display: inline-block;
            padding: 0.7rem 1rem;
            color: #555;
            text-decoration: none;
            white-space: nowrap;
            transition: color 0.15s;
            position: relative;
            letter-spacing: 0.04em;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 1px;
                background: #fff;
                transition: width 0.2s ease;
            }

            &:hover {
                color: #ccc;
                &::after { width: 60%; }
            }

            &:active,
            &.active {
                color: #fff;
                &::after { width: 60%; }
            }
        }
    }
`;

export default SubNavigation;
