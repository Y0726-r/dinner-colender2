// ============================================
// 🐰 うさぎカレンダー - Reactアプリ本体
// ============================================

const { useState, useEffect } = React;

// LocalStorageキー（ユーザー別）
const STORAGE_KEY = (name) => "dinner-meals-" + (name || "default");

// 日付フォーマット
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isToday(d) {
    return formatDate(d) === formatDate(new Date());
}

function getRandomBunnyIcon() {
    if (!window.BunnyIcons) return "";
    const icons = [
        BunnyIcons.face,
        BunnyIcons.standing,
        BunnyIcons.sitting
    ].filter(Boolean);
    return icons[Math.floor(Math.random() * icons.length)];
}

// ============================================
// メインアプリ
// ============================================
function App() {
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
    const [tempName, setTempName] = useState("");   // ← 入力中の名前
    const [meals, setMeals] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ----------------------------
    // 名前が決定した瞬間に meals を読み込む
    // ----------------------------
    useEffect(() => {
        if (!userName) return; // 名前未入力なら何もしない

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
        if (!userName) return;
        const key = STORAGE_KEY(userName);
        localStorage.setItem(key, JSON.stringify(meals));
    }, [meals, userName]);

    // ----------------------------
    // 📝 名前未設定 → 名前入力画面を出す
    // ----------------------------
    if (!userName) {
        return (
            <div className="name-setup">
                <h2>あなたの名前を入力してね🐰</h2>

                <input
                    className="name-input"
                    placeholder="例: Mitsuki"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                />

                <button
                    className="button button-primary"
                    onClick={() => {
                        if (!tempName.trim()) return;
                        localStorage.setItem("userName", tempName.trim());
                        setUserName(tempName.trim());   // ← reload なし！
                    }}
                >
                    決定
                </button>
            </div>
        );
    }

    // ----------------------------
    // ここから先はアプリ本体
    // ----------------------------

    const today = new Date();

    // 先週
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const lastWeekMenu = meals[formatDate(lastWeek)]?.menu || null;

    // ランキング
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyCount = {};

    Object.entries(meals).forEach(([dateStr, meal]) => {
        const d = new Date(dateStr);
        if (!meal?.menu?.trim()) return;
        if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return;

        monthlyCount[meal.menu] = (monthlyCount[meal.menu] || 0) + 1;
    });

    const ranking = Object.entries(monthlyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // 日付クリック
    const handleDateClick = (date) => {
        if (date.getMonth() !== currentDate.getMonth()) return;
        setSelectedDate(date);

        if (meals[formatDate(date)]) {
            setShowDetailModal(true);
        } else {
            setShowEntryModal(true);
        }
    };

    // 保存処理
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
        setEditingMeal(meals[formatDate(selectedDate)]);
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
    // return（UI全部）
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
                        {ranking.length === 0
                            ? "今月はまだ記録がないよ🐰"
                            : ranking.map(([menu, count], i) => (
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

function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">🐰 夕飯カレンダー🍳</h1>
        </header>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

// ============================================
// 詳細モーダル
// ============================================
function DetailModal({ date, meal, onEdit, onDelete, onClose }) {
    if (!meal) return null;

    const handleDelete = () => {
        if (confirm("この記録を削除する？")) {
            onDelete();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3 className="modal-title">
                        {date.toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div
                    className="detail-bunny"
                    dangerouslySetInnerHTML={{ __html: BunnyIcons.sitting }}
                />

                {meal.photo && (
                    <div className="detail-photo">
                        <img src={meal.photo} alt={meal.menu} />
                    </div>
                )}

                <div className="detail-menu">{meal.menu}</div>

                {meal.memo && <div className="detail-memo">{meal.memo}</div>}

                <div className="button-group">
                    <button className="button button-danger" onClick={handleDelete}>
                        削除
                    </button>
                    <button className="button button-primary" onClick={onEdit}>
                        編集
                    </button>
                </div>
            </div>
        </div>
    );
}
