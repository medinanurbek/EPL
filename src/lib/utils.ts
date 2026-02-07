export const getTeamLogo = (teamName: string) => {
    const name = teamName.toLowerCase();

    if (name.includes('arsenal')) return '/logos/arsenal.football-logos.cc.svg';
    if (name.includes('manchester city')) return '/logos/manchester-city.football-logos.cc.svg';
    if (name.includes('manchester united')) return '/logos/manchester-united.football-logos.cc.svg';
    if (name.includes('liverpool')) return '/logos/liverpool.football-logos.cc.svg';
    if (name.includes('chelsea')) return '/logos/chelsea.football-logos.cc.svg';
    if (name.includes('tottenham')) return '/logos/tottenham.football-logos.cc.svg';
    if (name.includes('arsenal')) return '/logos/arsenal.football-logos.cc.svg';
    if (name.includes('aston villa')) return '/logos/aston-villa.football-logos.cc.svg';
    if (name.includes('bournemouth')) return '/logos/bournemouth.football-logos.cc.svg';
    if (name.includes('brentford')) return '/logos/brentford.football-logos.cc.svg';
    if (name.includes('brighton')) return '/logos/brighton.football-logos.cc.svg';
    if (name.includes('burnley')) return '/logos/burnley.football-logos.cc.svg';
    if (name.includes('crystal palace')) return '/logos/crystal-palace.football-logos.cc.svg';
    if (name.includes('everton')) return '/logos/everton.football-logos.cc.svg';
    if (name.includes('fulham')) return '/logos/fulham.football-logos.cc.svg';
    if (name.includes('leeds')) return '/logos/leeds-united.football-logos.cc.svg';
    if (name.includes('newcastle')) return '/logos/newcastle.football-logos.cc.svg';
    if (name.includes('nottingham')) return '/logos/nottingham-forest.football-logos.cc.svg';
    if (name.includes('sunderland')) return '/logos/sunderland.football-logos.cc.svg';
    if (name.includes('west ham')) return '/logos/west-ham.football-logos.cc.svg';
    if (name.includes('wolves') || name.includes('wolverhampton')) return '/logos/wolves.football-logos.cc.svg';

    return '/logo-fallback.svg';
};

export const getFlagClass = (iso2: string | undefined | null) => {
    if (!iso2) return '';
    const code = iso2.toLowerCase().trim();
    // SportMonks uses 'EN' for England, 'SCT' for Scotland, etc.
    if (code === 'en') return 'gb-eng';
    if (code === 'sct') return 'gb-sct';
    if (code === 'wls') return 'gb-wls';
    return code;
};
