import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import styled, { keyframes } from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStore,
    faMemory,
    faMicrochip,
    faHdd,
    faServer,
    faCheckCircle,
    faStar,
} from '@fortawesome/free-solid-svg-icons';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;

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

const KxyBalance = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(167,139,250,0.08);
    border: 1px solid rgba(167,139,250,0.2);
    border-radius: 20px;
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
    color: #a78bfa;
    font-weight: 600;
    margin-bottom: 2rem;
`;

const CategoryTabs = styled.div`
    display: flex;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid ${({ active }) => active ? '#fff' : '#1a1a1a'};
    background: ${({ active }) => active ? '#fff' : '#0a0a0a'};
    color: ${({ active }) => active ? '#000' : '#555'};

    &:hover { border-color: #444; color: ${({ active }) => active ? '#000' : '#ccc'}; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
`;

const ItemCard = styled.div<{ featured?: boolean }>`
    background: #0d0d0d;
    border: 1px solid ${({ featured }) => featured ? 'rgba(167,139,250,0.3)' : '#1a1a1a'};
    border-radius: 10px;
    padding: 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    animation: ${fadeIn} 0.3s ease both;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: ${({ featured }) => featured ? 'rgba(167,139,250,0.5)' : '#2a2a2a'};
        box-shadow: 0 0 20px rgba(255,255,255,0.03);
    }
`;

const FeaturedBadge = styled.div`
    position: absolute;
    top: 0.7rem;
    right: 0.7rem;
    background: rgba(167,139,250,0.15);
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.65rem;
    color: #a78bfa;
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;

const ItemIcon = styled.div`
    width: 42px;
    height: 42px;
    background: #111;
    border: 1px solid #1a1a1a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #888;
`;

const ItemName = styled.div`
    font-size: 0.95rem;
    font-weight: 600;
    color: #ddd;
`;

const ItemDesc = styled.div`
    font-size: 0.78rem;
    color: #555;
    line-height: 1.4;
    flex: 1;
`;

const ItemFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.4rem;
`;

const Price = styled.div`
    font-size: 0.9rem;
    font-weight: 700;
    color: #a78bfa;
`;

const BuyBtn = styled.button<{ bought?: boolean }>`
    padding: 0.45rem 1rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid ${({ bought }) => bought ? '#22c55e' : '#fff'};
    background: ${({ bought }) => bought ? 'rgba(34,197,94,0.1)' : '#fff'};
    color: ${({ bought }) => bought ? '#22c55e' : '#000'};

    &:hover {
        background: ${({ bought }) => bought ? 'rgba(34,197,94,0.15)' : '#e0e0e0'};
        transform: translateY(-1px);
    }
    &:active { transform: translateY(0); }
`;

const Toast = styled.div<{ visible: boolean }>`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #111;
    border: 1px solid #222;
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    color: #22c55e;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    pointer-events: none;
    opacity: ${({ visible }) => visible ? 1 : 0};
    transform: ${({ visible }) => visible ? 'translateY(0)' : 'translateY(10px)'};
    transition: all 0.2s ease;
`;

const SectionLabel = styled.div`
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #111;
`;

interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: any;
    category: string;
    featured?: boolean;
    amount: string;
}

const ITEMS: ShopItem[] = [
    { id: 'ram-1',   name: '1 GB RAM',       description: 'Add 1 GB of RAM to your resource pool.',     price: 100,  icon: faMemory,    category: 'ram',   amount: '+1 GB' },
    { id: 'ram-4',   name: '4 GB RAM',        description: 'Add 4 GB of RAM to your resource pool.',     price: 350,  icon: faMemory,    category: 'ram',   amount: '+4 GB', featured: true },
    { id: 'ram-8',   name: '8 GB RAM',        description: 'Add 8 GB of RAM to your resource pool.',     price: 600,  icon: faMemory,    category: 'ram',   amount: '+8 GB' },
    { id: 'cpu-25',  name: '25% CPU',         description: 'Add 25% CPU allocation to your pool.',       price: 80,   icon: faMicrochip, category: 'cpu',   amount: '+25%' },
    { id: 'cpu-100', name: '100% CPU',        description: 'Add 100% CPU allocation to your pool.',      price: 280,  icon: faMicrochip, category: 'cpu',   amount: '+100%', featured: true },
    { id: 'cpu-200', name: '200% CPU',        description: 'Add 200% CPU allocation to your pool.',      price: 500,  icon: faMicrochip, category: 'cpu',   amount: '+200%' },
    { id: 'disk-5',  name: '5 GB Disk',       description: 'Add 5 GB of disk space to your pool.',       price: 50,   icon: faHdd,       category: 'disk',  amount: '+5 GB' },
    { id: 'disk-20', name: '20 GB Disk',      description: 'Add 20 GB of disk space to your pool.',      price: 150,  icon: faHdd,       category: 'disk',  amount: '+20 GB', featured: true },
    { id: 'disk-50', name: '50 GB Disk',      description: 'Add 50 GB of disk space to your pool.',      price: 300,  icon: faHdd,       category: 'disk',  amount: '+50 GB' },
    { id: 'slot-1',  name: '1 Server Slot',   description: 'Unlock an additional server slot.',          price: 200,  icon: faServer,    category: 'slots', amount: '+1 Slot' },
    { id: 'slot-3',  name: '3 Server Slots',  description: 'Unlock 3 additional server slots. Bundle!', price: 500,  icon: faServer,    category: 'slots', amount: '+3 Slots', featured: true },
];

const CATEGORIES = ['all', 'ram', 'cpu', 'disk', 'slots'] as const;

export default () => {
    const [category, setCategory] = useState<string>('all');
    const [kxy, setKxy] = useState(1250);
    const [bought, setBought] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<string | null>(null);

    const filtered = ITEMS.filter((i) => category === 'all' || i.category === category);

    const handleBuy = (item: ShopItem) => {
        if (kxy < item.price) return;
        setKxy((k) => k - item.price);
        setBought((b) => new Set([...b, item.id]));
        setToast(`Purchased ${item.name}!`);
        setTimeout(() => setToast(null), 2500);
    };

    return (
        <PageContentBlock title={'Shop'}>
            <Header>
                <h1><FontAwesomeIcon icon={faStore} style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} /> Kroxy Shop</h1>
                <p>Spend your Kxy to expand your resources and unlock server slots.</p>
            </Header>

            <KxyBalance>
                <FontAwesomeIcon icon={faStar} />
                {kxy.toLocaleString()} Kxy available
            </KxyBalance>

            <CategoryTabs>
                {CATEGORIES.map((cat) => (
                    <Tab key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                        {cat === 'all' ? 'All Items' : cat.toUpperCase()}
                    </Tab>
                ))}
            </CategoryTabs>

            <SectionLabel>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</SectionLabel>

            <Grid>
                {filtered.map((item) => (
                    <ItemCard key={item.id} featured={item.featured}>
                        {item.featured && <FeaturedBadge><FontAwesomeIcon icon={faStar} style={{ marginRight: '3px' }} />Best Value</FeaturedBadge>}
                        <ItemIcon>
                            <FontAwesomeIcon icon={item.icon} />
                        </ItemIcon>
                        <ItemName>{item.name}</ItemName>
                        <ItemDesc>{item.description}</ItemDesc>
                        <ItemFooter>
                            <Price>✦ {item.price} Kxy</Price>
                            <BuyBtn
                                bought={bought.has(item.id)}
                                onClick={() => !bought.has(item.id) && handleBuy(item)}
                                disabled={kxy < item.price && !bought.has(item.id)}
                                style={{ opacity: kxy < item.price && !bought.has(item.id) ? 0.4 : 1 }}
                            >
                                {bought.has(item.id) ? (
                                    <><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '4px' }} />Owned</>
                                ) : 'Buy'}
                            </BuyBtn>
                        </ItemFooter>
                    </ItemCard>
                ))}
            </Grid>

            <Toast visible={!!toast}>
                <FontAwesomeIcon icon={faCheckCircle} />
                {toast}
            </Toast>
        </PageContentBlock>
    );
};
