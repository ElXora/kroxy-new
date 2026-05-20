import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import font from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';

export default createGlobalStyle`
    @font-face {
        font-family: 'IBM Plex Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 100 700;
        src: url(${font}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    /* =============================================
       KROXY PANEL — Black & White Animated Theme
    ============================================= */

    :root {
        --kroxy-bg:       #000000;
        --kroxy-surface:  #0a0a0a;
        --kroxy-card:     #111111;
        --kroxy-border:   #222222;
        --kroxy-accent:   #ffffff;
        --kroxy-accent2:  #cccccc;
        --kroxy-muted:    #555555;
        --kroxy-text:     #f0f0f0;
        --kroxy-subtext:  #888888;
        --kroxy-glow:     0 0 20px rgba(255,255,255,0.08);
        --kroxy-green:    #22c55e;
        --kroxy-yellow:   #eab308;
        --kroxy-red:      #ef4444;
        --kroxy-kxy:      #a78bfa;
    }

    @keyframes kroxy-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes kroxy-pulse-border {
        0%, 100% { border-color: #222; }
        50%       { border-color: #444; }
    }

    @keyframes kroxy-shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
    }

    @keyframes kroxy-spin-slow {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }

    @keyframes kroxy-glow-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        50%       { box-shadow: 0 0 16px 2px rgba(255,255,255,0.08); }
    }

    body {
        ${tw`font-sans`};
        background-color: var(--kroxy-bg);
        color: var(--kroxy-text);
        letter-spacing: 0.015em;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-medium tracking-normal font-header`};
        color: var(--kroxy-accent);
    }

    p {
        color: var(--kroxy-text);
        ${tw`leading-snug font-sans`};
    }

    form { ${tw`m-0`}; }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }
    input[type=number] { -moz-appearance: textfield !important; }

    /* Scrollbar */
    ::-webkit-scrollbar { background: none; width: 10px; height: 10px; }
    ::-webkit-scrollbar-thumb {
        background: #222;
        border-radius: 8px;
        border: 2px solid #000;
    }
    ::-webkit-scrollbar-thumb:hover { background: #333; }
    ::-webkit-scrollbar-track { background: transparent; }

    /* Page transitions */
    .fade-appear, .fade-enter {
        opacity: 0;
        transform: translateY(6px);
    }
    .fade-appear-active, .fade-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 200ms ease, transform 200ms ease;
    }
    .fade-exit {
        opacity: 1;
        transform: translateY(0);
    }
    .fade-exit-active {
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 150ms ease, transform 150ms ease;
    }

    /* Card animation */
    .kroxy-card {
        background: var(--kroxy-card);
        border: 1px solid var(--kroxy-border);
        border-radius: 8px;
        animation: kroxy-fade-in 0.3s ease both;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .kroxy-card:hover {
        border-color: #333;
        box-shadow: var(--kroxy-glow);
    }
`;
