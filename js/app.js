// ============================================
// 🐰 うさぎカレンダー - Reactアプリ本体
// ============================================

const { useState, useEffect } = React;

// LocalStorageキー
const STORAGE_KEY = 'bunny_calendar_meals';

// ユーティリティ: 日付フォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ユーティリティ: 日付を比較
function isSameDay(date1, date2) {
    return formatDate(date1) === formatDate(date2);
}

// ユーティリティ: 今日かどうか
function isToday(date) {
    return isSameDay(date, new Date());
}

// ============================================
// メインアプリコンポーネント
// ============================================
function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meals, setMeals] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // LocalStorageからデータを読み込み
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setMeals(JSON.parse(stored));
            } catch (e) {
                console.error('データの読み込みに失敗しました', e);
            }
        }
    }, []);

    // LocalStorageにデータを保存
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    }, [meals]);

    // 日付セルをクリック
    const handleDateClick = (date) => {
        if (date.getMonth() !== currentDate.getMonth()) return;
        setSelectedDate(date);
        const dateKey = formatDate(date);
        if (meals[dateKey]) {
            setShowDetailModal(true);
        } else {
            setShowEntryModal(true);
        }
    };

    // 食事を保存
    const saveMeal = (mealData) => {
        const dateKey = formatDate(selectedDate);
        setMeals(prev => ({
            ...prev,
            [dateKey]: mealData
        }));
        setShowEntryModal(false);
        setEditingMeal(null);
    };

    // 食事を削除
    const deleteMeal = () => {
        const dateKey = formatDate(selectedDate);
        setMeals(prev => {
            const newMeals = { ...prev };
            delete newMeals[dateKey];
            return newMeals;
        });
        setShowDetailModal(false);
    };

    // 編集モードに切り替え
    const startEdit = () => {
        const dateKey = formatDate(selectedDate);
        setEditingMeal(meals[dateKey]);
        setShowDetailModal(false);
        setShowEntryModal(true);
    };

    // 前月へ
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // 次月へ
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // 検索結果をフィルター
    const searchResults = searchQuery.trim() ? 
        Object.entries(meals)
            .filter(([date, meal]) => 
                meal.menu.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => b[0].localeCompare(a[0]))
        : [];

    return (
        <div>
            <Header />
            <SearchBar 
                query={searchQuery}
                setQuery={setSearchQuery}
                results={searchResults}
                onResultClick={(date) => {
                    setSelectedDate(new Date(date));
                    setShowDetailModal(true);
                    setSearchQuery('');
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
// ヘッダーコンポーネント
// ============================================
function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">
                <span>🐰</span>
                <span>うさぎカレンダー</span>
            </h1>
        </header>
    );
}

// ============================================
// 検索バーコンポーネント
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
                    {results.map(([date, meal]) => (
                        <div
                            key={date}
                            className="search-result-item"
                            onClick={() => onResultClick(date)}
                        >
                            <div className="search-result-date">
                                {new Date(date).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
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
// カレンダーコンポーネント
// ============================================
function Calendar({ currentDate, meals, onDateClick, onPrevMonth, onNextMonth }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // カレンダーの日付配列を生成
    const calendarDates = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0: 日曜日

    // 前月の日付
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        calendarDates.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // 当月の日付
    for (let i = 1; i <= lastDay.getDate(); i++) {
        calendarDates.push(new Date(year, month, i));
    }

    // 次月の日付
    const remainingCells = 42 - calendarDates.length; // 6週分
    for (let i = 1; i <= remainingCells; i++) {
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
                {calendarDates.map((date, index) => (
                    <DateCell
                        key={index}
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

// ============================================
// カレンダーヘッダー
// ============================================
function CalendarHeader({ year, month, onPrev, onNext }) {
    return (
        <div className="calendar-header">
            <button className="nav-button" onClick={onPrev}>
                ‹
            </button>
            <h2 className="month-title">
                <span className="month-bunny" dangerouslySetInnerHTML={{ __html: BunnyIcons.face }} />
                <span>{year}年 {month + 1}月</span>
            </h2>
            <button className="nav-button" onClick={onNext}>
                ›
            </button>
        </div>
    );
}

// ============================================
// 曜日ヘッダー
// ============================================
function WeekdayHeader() {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return (
        <div className="weekday-header">
            {weekdays.map((day, index) => (
                <div 
                    key={day} 
                    className={`weekday-name ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
                >
                    {day}
                </div>
            ))}
        </div>
    );
}

// ============================================
// 日付セル
// ============================================
function DateCell({ date, currentMonth, meal, onClick }) {
    const isOtherMonth = date.getMonth() !== currentMonth;
    const isTodayDate = isToday(date);
    const hasRecord = !!meal;

    let className = 'date-cell';
    if (isOtherMonth) className += ' other-month';
    if (isTodayDate) className += ' today';
    if (hasRecord) className += ' has-record';

    return (
        <div className={className} onClick={onClick}>
            <div className="date-number">{date.getDate()}</div>
            {!isOtherMonth && (
                <div 
                    className="bunny-container" 
                    dangerouslySetInnerHTML={{ 
                        __html: isTodayDate ? BunnyIcons.standing : getRandomBunnyIcon()
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
    const [menu, setMenu] = useState(initialData?.menu || '');
    const [memo, setMemo] = useState(initialData?.memo || '');
    const [photo, setPhoto] = useState(initialData?.photo || null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPhoto(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!menu.trim()) {
            alert('メニュー名を入力してください');
            return;
        }
        onSave({ menu: menu.trim(), memo: memo.trim(), photo });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        📝 {date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                    </h3>
                    <button className="close-button" onClick={onClose}>×</button>
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
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
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
                        <button type="button" className="button button-secondary" onClick={onClose}>
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
    const handleDelete = () => {
        if (confirm('この記録を削除しますか?')) {
            onDelete();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        {date.toLocaleDateString('ja-JP', { 
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="detail-bunny" dangerouslySetInnerHTML={{ __html: BunnyIcons.sitting }} />
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
// アプリをレンダリング
// ============================================
ReactDOM.render(<App />, document.getElementById('root'));
