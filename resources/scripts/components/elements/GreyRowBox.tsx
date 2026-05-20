import styled from 'styled-components/macro';

export default styled.div<{ $hoverable?: boolean }>`
    display: flex;
    border-radius: 10px;
    text-decoration: none;
    color: #ddd;
    align-items: center;
    background: #0d0d0d;
    padding: 1rem;
    border: 1px solid #1a1a1a;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;

    ${(props) => props.$hoverable !== false && `
        &:hover {
            border-color: #2a2a2a;
            box-shadow: 0 0 16px rgba(255,255,255,0.03);
        }
    `}

    & .icon {
        border-radius: 50%;
        width: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #111;
        padding: 0.75rem;
    }
`;
