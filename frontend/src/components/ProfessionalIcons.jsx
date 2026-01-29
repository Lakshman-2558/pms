// Professional Medical Specialty Icons
// Smaller, more professional with specialty-specific colors and interactive hover animations

export const CardiologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
        </defs>
        {/* Heart Shape with beat animation */}
        <path
            d="M40 65C40 65 15 48 15 32C15 24 20 18 27 18C32 18 36 21 40 26C44 21 48 18 53 18C60 18 65 24 65 32C65 48 40 65 40 65Z"
            fill="url(#heartGradient)"
            style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
            }}
        />
        {/* Pulse line */}
        <path
            d="M20 40 L28 40 L32 28 L36 52 L40 40 L44 40"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity={isHovered ? "1" : "0.7"}
            style={{ transition: 'opacity 0.3s ease' }}
        />
    </svg>
);

export const DentistryIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="toothGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
        </defs>
        {/* Tooth */}
        <path
            d="M40 18C30 18 23 24 23 33C23 40 25 47 27 54C28 59 30 63 33 63C35 63 36 61 36 57L36 42C36 38 38 36 40 36C42 36 44 38 44 42L44 57C44 61 45 63 47 63C50 63 52 59 53 54C55 47 57 40 57 33C57 24 50 18 40 18Z"
            fill="url(#toothGradient)"
            stroke="#3b82f6"
            strokeWidth="2"
            style={{
                filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
                transition: 'filter 0.3s ease'
            }}
        />
        {/* Shine */}
        <ellipse
            cx="33"
            cy="28"
            rx="5"
            ry="8"
            fill="white"
            opacity={isHovered ? "0.8" : "0.4"}
            style={{ transition: 'opacity 0.3s ease' }}
        />
    </svg>
);

export const NeurologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
        </defs>
        {/* Brain outline */}
        <path
            d="M40 15C28 15 20 22 20 32C20 36 21 40 22 43C20 45 19 47 19 50C19 54 22 58 26 59C26 63 29 66 34 68C36 68 38 68 40 68C42 68 44 68 46 68C51 66 54 63 54 59C58 58 61 54 61 50C61 47 60 45 58 43C59 40 60 36 60 32C60 22 52 15 40 15Z"
            fill="url(#brainGradient)"
        />
        {/* Neural nodes */}
        {[
            { cx: 30, cy: 32, delay: 0 },
            { cx: 40, cy: 28, delay: 0.1 },
            { cx: 50, cy: 32, delay: 0.2 },
            { cx: 35, cy: 45, delay: 0.3 },
            { cx: 45, cy: 45, delay: 0.4 }
        ].map((node, i) => (
            <circle
                key={i}
                cx={node.cx}
                cy={node.cy}
                r={isHovered ? "3" : "2"}
                fill="white"
                opacity={isHovered ? "0.9" : "0.5"}
                style={{
                    transition: `all 0.3s ease ${node.delay}s`,
                    transformOrigin: `${node.cx}px ${node.cy}px`
                }}
            />
        ))}
    </svg>
);

export const PediatricsIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="childGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
        </defs>
        {/* Head */}
        <circle cx="40" cy="28" r="12" fill="url(#childGradient)" />
        {/* Body */}
        <ellipse cx="40" cy="50" rx="14" ry="18" fill="url(#childGradient)" />
        {/* Eyes */}
        <circle cx="36" cy="27" r="1.5" fill="white" />
        <circle cx="44" cy="27" r="1.5" fill="white" />
        {/* Smile - changes on hover */}
        <path
            d={isHovered ? "M35 31 Q40 35 45 31" : "M36 31 Q40 33 44 31"}
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{ transition: 'd 0.3s ease' }}
        />
        {/* Heart accessory */}
        <path
            d="M58 22C58 22 55 20 53 22C51 20 48 22 48 22C48 25 53 28 53 28C53 28 58 25 58 22Z"
            fill="#fbbf24"
            opacity={isHovered ? "1" : "0.7"}
            style={{ transition: 'opacity 0.3s ease' }}
        />
    </svg>
);

export const OrthopedicsIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="100%" stopColor="#d1d5db" />
            </linearGradient>
        </defs>
        {/* Bone structure */}
        <g style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
        }}>
            {/* Left bone */}
            <rect x="32" y="22" width="6" height="36" rx="3" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
            {/* Right bone */}
            <rect x="42" y="22" width="6" height="36" rx="3" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
            {/* Joints */}
            <circle cx="35" cy="22" r="5" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
            <circle cx="45" cy="22" r="5" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
            <circle cx="35" cy="58" r="5" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
            <circle cx="45" cy="58" r="5" fill="url(#boneGradient)" stroke="#10b981" strokeWidth="2" />
        </g>
    </svg>
);

export const OphthalmologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="irisGrad">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
            </radialGradient>
        </defs>
        {/* Eye shape - opens on hover */}
        <ellipse
            cx="40"
            cy="40"
            rx="28"
            ry={isHovered ? "20" : "16"}
            fill="white"
            stroke="#64748b"
            strokeWidth="2"
            style={{ transition: 'ry 0.3s ease' }}
        />
        {/* Iris */}
        <circle
            cx="40"
            cy="40"
            r={isHovered ? "12" : "10"}
            fill="url(#irisGrad)"
            style={{ transition: 'r 0.3s ease' }}
        />
        {/* Pupil */}
        <circle
            cx="40"
            cy="40"
            r={isHovered ? "6" : "5"}
            fill="#1e293b"
            style={{ transition: 'r 0.3s ease' }}
        />
        {/* Light reflection */}
        <circle cx="44" cy="36" r="3" fill="white" opacity="0.9" />
        <circle cx="38" cy="42" r="1.5" fill="white" opacity="0.6" />
        {/* Upper eyelid - lifts on hover */}
        <path
            d={isHovered ? "M12 35 Q40 30 68 35" : "M12 38 Q40 34 68 38"}
            stroke="#64748b"
            strokeWidth="2"
            fill="none"
            style={{ transition: 'd 0.3s ease' }}
        />
    </svg>
);

export const GastroenterologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="stomachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
        </defs>
        {/* Stomach/digestive system */}
        <path
            d="M40 18 Q50 18 55 28 Q58 35 55 45 Q52 55 45 60 Q40 63 35 60 Q28 55 25 45 Q22 35 25 28 Q30 18 40 18Z"
            fill="url(#stomachGradient)"
            opacity={isHovered ? "1" : "0.9"}
            style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center',
                transition: 'all 0.3s ease'
            }}
        />
        {/* Intestine curves */}
        <path
            d="M35 60 Q30 65 32 70"
            stroke="#f97316"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity={isHovered ? "0.8" : "0.6"}
        />
        <path
            d="M45 60 Q50 65 48 70"
            stroke="#f97316"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity={isHovered ? "0.8" : "0.6"}
        />
    </svg>
);

export const GynecologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gyneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
        </defs>
        {/* Female symbol stylized */}
        <circle
            cx="40"
            cy="32"
            r={isHovered ? "14" : "12"}
            fill="none"
            stroke="url(#gyneGradient)"
            strokeWidth="3"
            style={{ transition: 'r 0.3s ease' }}
        />
        <line x1="40" y1="46" x2="40" y2="62" stroke="url(#gyneGradient)" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="54" x2="48" y2="54" stroke="url(#gyneGradient)" strokeWidth="3" strokeLinecap="round" />
        {/* Flower petals for femininity */}
        <circle cx="40" cy="32" r="4" fill="#fbbf24" opacity={isHovered ? "1" : "0.7"} />
    </svg>
);

export const DermatologyIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
        </defs>
        {/* Skin layers */}
        <ellipse
            cx="40"
            cy="40"
            rx="24"
            ry="24"
            fill="url(#skinGradient)"
            opacity="0.3"
        />
        <ellipse
            cx="40"
            cy="40"
            rx="18"
            ry="18"
            fill="url(#skinGradient)"
            opacity="0.5"
        />
        <ellipse
            cx="40"
            cy="40"
            rx="12"
            ry="12"
            fill="url(#skinGradient)"
            opacity="0.7"
        />
        {/* Sparkles for healthy skin */}
        {isHovered && (
            <>
                <circle cx="28" cy="28" r="2" fill="#fbbf24" className="animate-ping" />
                <circle cx="52" cy="32" r="2" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.2s' }} />
                <circle cx="48" cy="52" r="2" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.4s' }} />
            </>
        )}
    </svg>
);

export const ENTIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="entGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
        </defs>
        {/* Ear shape */}
        <path
            d="M45 20 Q55 25 55 40 Q55 55 45 60 Q40 62 38 58 Q36 54 38 50 Q40 46 42 46 Q44 46 44 48 Q44 50 42 50"
            fill="none"
            stroke="url(#entGradient)"
            strokeWidth="3"
            style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
            }}
        />
        {/* Sound waves */}
        {isHovered && (
            <>
                <path d="M25 30 Q20 40 25 50" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M20 28 Q14 40 20 52" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.4" />
            </>
        )}
    </svg>
);

export const PsychiatryIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="mentalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
        </defs>
        {/* Head silhouette */}
        <circle cx="40" cy="35" r="16" fill="url(#mentalGradient)" opacity="0.3" />
        <ellipse cx="40" cy="55" rx="12" ry="8" fill="url(#mentalGradient)" opacity="0.3" />
        {/* Brain/thought symbol */}
        <path
            d="M35 30 Q32 28 32 32 Q32 35 35 35 Q38 35 40 33 Q42 35 45 35 Q48 35 48 32 Q48 28 45 30"
            fill="url(#mentalGradient)"
            style={{
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.3s ease'
            }}
        />
        {/* Thought bubbles */}
        <circle cx="50" cy="25" r={isHovered ? "4" : "3"} fill="url(#mentalGradient)" opacity="0.6" style={{ transition: 'r 0.3s ease' }} />
        <circle cx="56" cy="20" r={isHovered ? "3" : "2"} fill="url(#mentalGradient)" opacity="0.5" style={{ transition: 'r 0.3s ease' }} />
    </svg>
);

export const GeneralMedicineIcon = ({ isHovered }) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="medGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
        </defs>
        {/* Medical cross */}
        <rect
            x="35"
            y="20"
            width="10"
            height="40"
            rx="2"
            fill="url(#medGradient)"
            style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
            }}
        />
        <rect
            x="20"
            y="35"
            width="40"
            height="10"
            rx="2"
            fill="url(#medGradient)"
            style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
            }}
        />
        {/* Stethoscope hint */}
        <circle cx="55" cy="55" r="6" fill="none" stroke="#3b82f6" strokeWidth="2" opacity={isHovered ? "1" : "0.6"} />
    </svg>
);
