// ============================================
// 🐰 うさぎSVGアイコン
// ============================================

const BunnyIcons = {
    // タイプ1: 座っているうさぎ (side view)
    sitting: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#9db59d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- 耳 (左) -->
                <path d="M 35 20 Q 32 10, 30 5 Q 28 10, 30 20" fill="#f5f5f5"/>
                <!-- 耳 (右) -->
                <path d="M 45 18 Q 48 8, 50 3 Q 52 8, 50 18" fill="#f5f5f5"/>
                <!-- 頭 -->
                <circle cx="40" cy="35" r="15" fill="#ffffff"/>
                <!-- 体 -->
                <ellipse cx="48" cy="55" rx="20" ry="22" fill="#ffffff"/>
                <!-- 目 -->
                <circle cx="37" cy="32" r="2" fill="#6b8e6b"/>
                <!-- しっぽ -->
                <circle cx="65" cy="62" r="6" fill="#f5f5f5"/>
            </g>
        </svg>
    `,

    // タイプ2: 正面を向いてちょこんとしているうさぎ
    standing: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#9db59d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- 耳 (左) -->
                <path d="M 35 15 Q 32 5, 30 2 Q 28 8, 32 18" fill="#f5f5f5"/>
                <!-- 耳 (右) -->
                <path d="M 65 15 Q 68 5, 70 2 Q 72 8, 68 18" fill="#f5f5f5"/>
                <!-- 頭 -->
                <circle cx="50" cy="40" r="18" fill="#ffffff"/>
                <!-- 体 -->
                <ellipse cx="50" cy="68" rx="22" ry="25" fill="#ffffff"/>
                <!-- 目 (左) -->
                <circle cx="44" cy="38" r="2" fill="#6b8e6b"/>
                <!-- 目 (右) -->
                <circle cx="56" cy="38" r="2" fill="#6b8e6b"/>
                <!-- 鼻 -->
                <path d="M 50 45 L 48 48 M 50 45 L 52 48" stroke="#b5c9b6" stroke-width="1.5"/>
            </g>
        </svg>
    `,

    // タイプ3: 顔だけのうさぎ
    face: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#9db59d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- 耳 (左) -->
                <path d="M 32 20 Q 28 8, 25 5 Q 23 12, 28 25" fill="#f5f5f5"/>
                <!-- 耳 (右) -->
                <path d="M 68 20 Q 72 8, 75 5 Q 77 12, 72 25" fill="#f5f5f5"/>
                <!-- 顔 -->
                <circle cx="50" cy="50" r="25" fill="#ffffff"/>
                <!-- 目 (左) -->
                <circle cx="42" cy="48" r="2.5" fill="#6b8e6b"/>
                <!-- 目 (右) -->
                <circle cx="58" cy="48" r="2.5" fill="#6b8e6b"/>
                <!-- 鼻 -->
                <circle cx="50" cy="56" r="2" fill="#d4b8aa"/>
                <!-- 口 -->
                <path d="M 50 56 Q 45 62, 42 60 M 50 56 Q 55 62, 58 60" stroke="#b5c9b6" stroke-width="1.5"/>
                <!-- ほっぺ (左) -->
                <circle cx="35" cy="54" r="3" fill="#f5d9d9" opacity="0.5" stroke="none"/>
                <!-- ほっぺ (右) -->
                <circle cx="65" cy="54" r="3" fill="#f5d9d9" opacity="0.5" stroke="none"/>
            </g>
        </svg>
    `,
};

// ランダムにうさぎアイコンを取得
function getRandomBunnyIcon() {
    const icons = [BunnyIcons.sitting, BunnyIcons.standing, BunnyIcons.face];
    return icons[Math.floor(Math.random() * icons.length)];
}
