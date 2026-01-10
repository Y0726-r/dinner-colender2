// ============================================
// 🐰 夕飯カレンダー React アプリ（完全版）
// ============================================

const { useState, useEffect } = React;

// 🔑 LocalStorage キー
const USER_NAME_KEY = "bunny-calendar-user-name";
const STORAGE_KEY = (name) => "bunny-calendar-meals-" + (name || "default");

// 日付フォーマット（YYYY-MM-DD）
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// 今日判定
function isSameDay(d1, d2) {
    return formatDate(d1) === formatDate(d2);
}
function isToday(date) {
    return isSameDay(date, new Date());
}

// うさぎアイコン
function getRandomBunnyIcon() {
    if (!window.BunnyIcons) return "";
    const icons = [BunnyIcons.face, BunnyIcons.standing, BunnyIcons.sitting].filter(
        Boolean
    );
    if (icons.length === 0) return "";
    return icons[Math.floor(Math.random() * icons.length)];
}

// ============================================
// メインアプリ
// ============================================
// ============================================
// メインアプリ
// ============================================
// ============================================
// メインアプリ
// ============================================
function App() {
    const [userName, setUserName] = useState(undefined);
    const [tempName, setTempName] = useState("");
    const [isLoading, setIsLoading] = useState(true);  // ★追加: ローディング状態
    const [meals, setMeals] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ★1. 初回だけ userName を読み込む
    useEffect(() => {
        const storedName = localStorage.getItem(USER_NAME_KEY);
        if (storedName) {
            setUserName(storedName);
        } else {
            setUserName("");
        }
        setIsLoading(false);  // ★読み込み完了
    }, []);

    // ★2. userName が確定したらデータを読み込む
    useEffect(() => {
        if (!userName || userName === "") return;
        
        const key = STORAGE_KEY(userName);
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setMeals(JSON.parse(stored));
            } catch (e) {
                console.error("データの読み込みに失敗しました", e);
            }
        }
    }, [userName]);

    // ★3. meals が変更されたら LocalStorage に保存
    useEffect(() => {
        if (!userName || userName === "") return;
        
        const key = STORAGE_KEY(userName);
        localStorage.setItem(key, JSON.stringify(meals));
    }, [meals, userName]);

    // ============================
    // ① 読み込み中は何も表示しない
    // ============================
    if (isLoading) {
        return null;  // または <div className="loading">読み込み中...</div>
    }

    // ============================
    // ② 名前がまだなら名前入力画面だけ出す
    // ============================
    if (userName === "") {
        return (
            <div className="name-setup">
                <h2>あなたの名前を入力してね🐰</h2>
                <input
                    className="name-input"
                    placeholder="例: Mitsuki"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            const name = tempName.trim();
                            if (!name) {
                                alert("名前を入力してね🐰");
                                return;
                            }
                            localStorage.setItem(USER_NAME_KEY, name);
                            setUserName(name);
                        }
                    }}
                />
                <button
                    className="button button-primary"
                    onClick={() => {
                        const name = tempName.trim();
                        if (!name) {
                            alert("名前を入力してね🐰");
                            return;
                        }
                        localStorage.setItem(USER_NAME_KEY, name);
                        setUserName(name);
                    }}
                >
                    決定
                </button>
            </div>
        );
    }

    // （以下は元のコードと同じ）
    // ...



    // ============================
    // ② ここから通常画面
    // ============================
    const today = new Date();

    // 1週間前
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const lastWeekKey = formatDate(lastWeek);
    const lastWeekMenu = meals[lastWeekKey]?.menu || null;

    // 今月ランキング（年も見る）
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyCount = {};

    Object.entries(meals).forEach(([dateStr, meal]) => {
        const d = new Date(dateStr);
        if (!meal || !meal.menu || !meal.menu.trim()) return;
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
        const key = formatDate(date);
        if (meals[key]) {
            setShowDetailModal(true);
        } else {
            setShowEntryModal(true);
        }
    };

    // 保存
    const saveMeal = (mealData) => {
        if (!selectedDate) return;
        const key = formatDate(selectedDate);
        setMeals((prev) => ({
            ...prev,
            [key]: mealData,
        }));
        setShowEntryModal(false);
        setEditingMeal(null);
    };

    // 削除
    const deleteMeal = () => {
        if (!selectedDate) return;
        const key = formatDate(selectedDate);
        setMeals((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
        setShowDetailModal(false);
    };

    // 編集開始
    const startEdit = () => {
        if (!selectedDate) return;
        const key = formatDate(selectedDate);
        setEditingMeal(meals[key]);
        setShowDetailModal(false);
        setShowEntryModal(true);
    };

    // 月移動
    const prevMonth = () =>
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
    const nextMonth = () =>
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );

    // 検索
    const searchResults = searchQuery.trim()
        ? Object.entries(meals)
              .filter(([dateStr, meal]) =>
                  (meal?.menu || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => b[0].localeCompare(a[0]))
        : [];

    return (
        <div>
            <Header />

            {/* 情報カード */}
            <div className="info-section">
                <div className="info-card">
                    <div className="info-card-title">📅 1週間前の今日</div>
                    <div className="info-card-content">
                        {lastWeekMenu ? (
                            <>
                                先週は『<b>{lastWeekMenu}</b>』食べてたよ🐰✨
                            </>
                        ) : (
                            "先週の記録はまだないみたい🐾"
                        )}
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-card-title">🏆 今月の人気メニュー</div>
                    <div className="info-card-content">
                        {ranking.length === 0 && "今月はまだ記録がないよ🐰"}
                        {ranking.length > 0 &&
                            ranking.map(([menu, count], i) => (
                                <div key={menu}>
                                    {i + 1}位：{menu}（{count}回）
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <SearchBar
                query={searchQuery}
                setQuery={setSearchQuery}
                results={searchResults}
                onResultClick={(dateStr) => {
                    const d = new Date(dateStr);
                    setSelectedDate(d);
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

            {showEntryModal && selectedDate && (
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

            {showDetailModal && selectedDate && (
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
// ヘッダー
// ============================================
function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">
                <span>🐰</span>
                <span>夕飯カレンダー🍳</span>
            </h1>
        </header>
    );
}

// ============================================
// 検索バー
// ============================================
function SearchBar({ query, setQuery, results, onResultClick }) {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="🔍 メニューを検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {results.length > 0 && (
                <div className="search-results">
                    <div className="search-results-title">
                        検索結果 ({results.length}件)
                    </div>
                    {results.map(([dateStr, meal]) => (
                        <div
                            key={dateStr}
                            className="search-result-item"
                            onClick={() => onResultClick(dateStr)}
                        >
                            <div className="search-result-date">
                                {new Date(dateStr).toLocaleDateString("ja-JP", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="search-result-menu">{meal.menu}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// カレンダー
// ============================================
function Calendar({ currentDate, meals, onDateClick, onPrevMonth, onNextMonth }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDates = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    // 前月分
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        calendarDates.push(new Date(year, month - 1, prevMonthLast - i));
    }

    // 当月分
    for (let d = 1; d <= lastDay.getDate(); d++) {
        calendarDates.push(new Date(year, month, d));
    }

    // 次月分（6週＝42セルに合わせる）
    const remain = 42 - calendarDates.length;
    for (let i = 1; i <= remain; i++) {
        calendarDates.push(new Date(year, month + 1, i));
    }

    return (
        <div className="calendar-container">
            <CalendarHeader
                year={year}
                month={month}
                onPrev={onPrevMonth}
                onNext={onNextMonth}
            />
            <WeekdayHeader />
            <div className="calendar-grid">
                {calendarDates.map((date, idx) => (
                    <DateCell
                        key={idx}
                        date={date}
                        currentMonth={month}
                        meal={meals[formatDate(date)]}
                        onClick={() => onDateClick(date)}
                    />
                ))}
            </div>
        </div>
    );
}

function CalendarHeader({ year, month, onPrev, onNext }) {
    return (
        <div className="calendar-header">
            <button className="nav-button" onClick={onPrev}>
                ‹
            </button>
            <h2 className="month-title">
                <span
                    className="month-bunny"
                    dangerouslySetInnerHTML={{
                        __html: (window.BunnyIcons && BunnyIcons.face) || "",
                    }}
                />
                <span>
                    {year}年 {month + 1}月
                </span>
            </h2>
            <button className="nav-button" onClick={onNext}>
                ›
            </button>
        </div>
    );
}

function WeekdayHeader() {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return (
        <div className="weekday-header">
            {weekdays.map((w, i) => (
                <div
                    key={w}
                    className={
                        "weekday-name " +
                        (i === 0 ? "sunday " : "") +
                        (i === 6 ? "saturday" : "")
                    }
                >
                    {w}
                </div>
            ))}
        </div>
    );
}

function DateCell({ date, currentMonth, meal, onClick }) {
    const otherMonth = date.getMonth() !== currentMonth;
    const todayFlag = isToday(date);
    const hasRecord = !!meal;

    let className = "date-cell";
    if (otherMonth) className += " other-month";
    if (todayFlag) className += " today";
    if (hasRecord) className += " has-record";

    return (
        <div className={className} onClick={onClick}>
            <div className="date-number">{date.getDate()}</div>
            {!otherMonth && (
                <div
                    className="bunny-container"
                    dangerouslySetInnerHTML={{
                        __html: todayFlag
                            ? (window.BunnyIcons && BunnyIcons.standing) || ""
                            : getRandomBunnyIcon(),
                    }}
                />
            )}
            {hasRecord && <div className="menu-text">{meal.menu}</div>}
        </div>
    );
}

// ============================================
// 入力モーダル
// ============================================
function EntryModal({ date, initialData, onSave, onClose }) {
    const [menu, setMenu] = useState(initialData?.menu || "");
    const [memo, setMemo] = useState(initialData?.memo || "");
    const [photo, setPhoto] = useState(initialData?.photo || null);

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");

                const maxSize = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL("image/jpeg", 0.9);

                setPhoto(compressed);
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!menu.trim()) {
            alert("メニュー名を入力してね🐰");
            return;
        }
        onSave({
            menu: menu.trim(),
            memo: memo.trim(),
            photo: photo || null,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        📝{" "}
                        {date.toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </h3>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            メニュー名<span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={menu}
                            onChange={(e) => setMenu(e.target.value)}
                            placeholder="例: カレーライス"
                            autoFocus
                        />
                    </div>

                    <div className="photo-upload-container">
                        <label className="form-label">写真</label>
                        {photo ? (
                            <div className="photo-preview">
                                <img src={photo} alt="料理写真" />
                                <button
                                    type="button"
                                    className="photo-remove-button"
                                    onClick={() => setPhoto(null)}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label className="photo-upload-button">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handlePhotoChange}
                                />
                                <div className="icon">📷</div>
                                <div className="text">写真を追加</div>
                            </label>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">メモ</label>
                        <textarea
                            className="form-textarea"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="例: レシピメモ、感想など"
                        />
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={onClose}
                        >
                            キャンセル
                        </button>
                        <button type="submit" className="button button-primary">
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div
                    className="detail-bunny"
                    dangerouslySetInnerHTML={{
                        __html: (window.BunnyIcons && BunnyIcons.sitting) || "",
                    }}
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

// ============================================
// レンダリング
// ============================================
ReactDOM.render(<App />, document.getElementById("root"));
