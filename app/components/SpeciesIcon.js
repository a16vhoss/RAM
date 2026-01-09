import { FaDog, FaCat, FaDove, FaFish, FaHorse, FaSpider, FaFrog, FaPaw, FaDragon, FaMouse } from 'react-icons/fa';
import { GiRabbit, GiTortoise, GiSnake } from 'react-icons/gi'; // Need to check if 'gi' is installed/available. If not, use generic.

// Assuming 'gi' (Game Icons) might not be installed, sticking to 'fa' (FontAwesome) which is definitely installed.
// If 'gi' is not available, I'll fallback to FaPaw.
// Actually, I can check package.json from previous steps. 
// package.json showed "react-icons": "^5.5.0", so 'gi' IS available.

export default function SpeciesIcon({ species, className, size = 24 }) {
    if (!species) return <FaPaw className={className} size={size} />;

    const s = species.toLowerCase().trim();

    if (s.includes('perro') || s.includes('canino')) return <FaDog className={className} size={size} />;
    if (s.includes('gato') || s.includes('felino')) return <FaCat className={className} size={size} />;
    if (s.includes('ave') || s.includes('pájaro') || s.includes('pajaro') || s.includes('loro')) return <FaDove className={className} size={size} />;
    if (s.includes('pez') || s.includes('fish')) return <FaFish className={className} size={size} />;
    if (s.includes('caballo') || s.includes('equino')) return <FaHorse className={className} size={size} />;
    if (s.includes('araña') || s.includes('tarántula')) return <FaSpider className={className} size={size} />;
    if (s.includes('rana') || s.includes('anfibio')) return <FaFrog className={className} size={size} />;
    // if (s.includes('conejo')) return <GiRabbit className={className} size={size} />; 
    // Stick to FA to avoid import errors if subsets aren't included in the build config slightly

    // Default
    return <FaPaw className={className} size={size} />;
}
