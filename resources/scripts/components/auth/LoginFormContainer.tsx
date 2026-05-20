import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;

const Container = styled.div`
    ${breakpoint('sm')`width: 80%; margin: 0 auto;`};
    ${breakpoint('md')`padding: 2.5rem;`};
    ${breakpoint('lg')`width: 60%;`};
    ${breakpoint('xl')`width: 100%; max-width: 480px;`};
`;

const FormBox = styled.div`
    background: #0a0a0a;
    border: 1px solid #1a1a1a;
    border-radius: 12px;
    padding: 2.5rem;
    margin: 0 0.25rem;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    animation: ${fadeIn} 0.35s ease both;
`;

const LogoMark = styled.div`
    text-align: center;
    margin-bottom: 2rem;

    .logo-text {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        background: linear-gradient(90deg, #fff 0%, #888 40%, #fff 60%, #888 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ${shimmer} 4s linear infinite;
    }

    .logo-sub {
        font-size: 0.72rem;
        color: #444;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-top: 0.3rem;
    }
`;

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        <FlashMessageRender style={{ marginBottom: '0.5rem', padding: '0 0.25rem' }} />
        <Form {...props} ref={ref}>
            <FormBox>
                <LogoMark>
                    <div className={'logo-text'}>KROXY</div>
                    <div className={'logo-sub'}>{title || 'Panel'}</div>
                </LogoMark>
                <div>{props.children}</div>
            </FormBox>
        </Form>
        <p style={{ textAlign: 'center', color: '#333', fontSize: '0.72rem', marginTop: '1rem' }}>
            &copy; {new Date().getFullYear()} Kroxy Panel
        </p>
    </Container>
));
