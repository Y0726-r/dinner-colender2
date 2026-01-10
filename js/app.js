// ============================================
// 🐰 うさぎカレンダー - Reactアプリ本体
// ============================================

const { useState, useEffect } = React;

// 🔑 LocalStorageキー（ユーザー別） 
// LocalStorageキー（名前が決まるまで "default" を使う）
const STORAGE_KEY = (userName) => "dinner-meals-" + (userName || "default");

// 日付フォーマット
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isSameDay(d1, d2) {
    return formatDate(d1) === formatDate(d2);
}
function isToday(date) {
    return isSameDay(date, new Date());
}

// うさぎアイコン
function getRandomBunnyIcon() {
    if (!window.BunnyIcons) return "";
    const icons = [
        BunnyIcons.face,
        BunnyIcons.standing,
        BunnyIcons.sitting
    ].filter(Boolean);
    if (icons.length === 0) return "";
    return icons[Math.floor(Math.random() * icons.length)];
}

// ============================================
// メインアプリ
// ============================================
function App() {
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meals, setMeals] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ----------------------------
    // 初回データ読み込み（userName確定後）
    // ----------------------------
   useEffect(() => {
    const key = STORAGE_KEY(userName);
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            setMeals(JSON.parse(stored));
        } catch (e) {
            console.error("データ読み込み失敗", e);
        }
    }
}, [userName]);

    // 保存
   useEffect(() => {
    const key = STORAGE_KEY(userName);
    localStorage.setItem(key, JSON.stringify(meals));
}, [meals, userName]);


    // ----------------------------
    // 📝 ユーザー名が未設定 → 専用画面表示
    // ----------------------------
    if (!userName) {
        return (
            <div className="name-setup">
                <h2>あなたの名前を入力してね🐰</h2>
                <input
                    className="name-input"
                    placeholder="例: Mitsuki"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <button
                    className="button button-primary"
                    onClick={() => {
                        if (!userName.trim()) return;
                        localStorage.setItem("userName", userName.trim());
                        window.location.reload();
                    }}
                >
                    決定
                </button>
            </div>
        );
    }

    // ----------------------------
    // 分析ロジック
    // ----------------------------
    const today = new Date();

    // 先週の今日
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const lastWeekMenu = meals[formatDate(lastWeek)]?.menu || null;

    // 今月ランキング（年も比較）
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyCount = {};

    Object.entries(meals).forEach(([dateStr, meal]) => {
        const d = new Date(dateStr);

        if (!meal || !meal.menu || meal.menu.trim() === "") return;

        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
            monthlyCount[meal.menu] =
                (monthlyCount[meal.menu] || 0) + 1;
        }
    });

    const ranking = Object.entries(monthlyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // ----------------------------
    // 日付クリック
    // ----------------------------
    const handleDateClick = (date) => {
        if (date.getMonth() !== currentDate.getMonth()) return;
        setSelectedDate(date);

        if (meals[formatDate(date)]) {
            setShowDetailModal(true);
        } else {
            setShowEntryModal(true);
        }
    };

    const saveMeal = (mealData) => {
        const key = formatDate(selectedDate);
        setMeals((prev) => ({ ...prev, [key]: mealData }));
        setShowEntryModal(false);
        setEditingMeal(null);
    };

    const deleteMeal = () => {
        const key = formatDate(selectedDate);
        setMeals((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
        setShowDetailModal(false);
    };

    const startEdit = () => {
        const key = formatDate(selectedDate);
        setEditingMeal(meals[key]);
        setShowDetailModal(false);
        setShowEntryModal(true);
    };

    const prevMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const searchResults = searchQuery.trim()
        ? Object.entries(meals)
            .filter(([_, meal]) =>
                meal?.menu?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => b[0].localeCompare(a[0]))
        : [];

    // =============================================
    // return（UI）
    // =============================================
    return (
        <div>
            <Header />

            <div className="info-section">
                <div className="info-card">
                    <div className="info-card-title">📅 1週間前の今日</div>
                    <div className="info-card-content">
                        {lastWeekMenu
                            ? <>先週は『<b>{lastWeekMenu}</b>』食べてたよ🐰✨</>
                            : "先週の記録はまだないみたい🐾"}
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-card-title">🏆 今月の人気メニュー</div>
                    <div className="info-card-content">
                        {ranking.length === 0 && "今月はまだ記録がないよ🐰"}
                        {ranking.length > 0 &&
                            ranking.map(([menu, count], i) => (
                                <div key={menu}>{i + 1}位：{menu}（{count}回）</div>
                            ))}
                    </div>
                </div>
            </div>

            <SearchBar
                query={searchQuery}
                setQuery={setSearchQuery}
                results={searchResults}
                onResultClick={(dateStr) => {
                    setSelectedDate(new Date(dateStr));
                    setShowDetailModal(true);
                    setSearchQuery("");
                }}
            />

            <Calendar
                currentDate={currentDate}
                meals={meals}
                onDateClick={handleDateClick}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
            />

            {showEntryModal && (
                <EntryModal
                    date={selectedDate}
                    initialData={editingMeal}
                    onSave={saveMeal}
                    onClose={() => {
                        setShowEntryModal(false);
                        setEditingMeal(null);
                    }}
                />
            )}

            {showDetailModal && (
                <DetailModal
                    date={selectedDate}
                    meal={meals[formatDate(selectedDate)]}
                    onEdit={startEdit}
                    onDelete={deleteMeal}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
}

// ============================================
// 以下：Header, SearchBar, Calendar,
//       EntryModal, DetailModal は元のまま
// ============================================

function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">🐰 夕飯カレンダー🍳</h1>
        </header>
    );
}

// SearchBar / Calendar / Modal の部分は
// 長いので省略（元のコードのままでOK！）

// 最後のレンダリング
ReactDOM.render(<App />, document.getElementById("root"));
