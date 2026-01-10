function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meals, setMeals] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // LocalStorage 読み込み
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setMeals(JSON.parse(stored));
            } catch (e) {
                console.error("データの読み込み失敗", e);
            }
        }
    }, []);

    // 保存
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    }, [meals]);

    // -------------------------------
    // 🐰 ここから分析ロジック
    // -------------------------------
    const today = new Date();

    // 先週の今日
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const lastWeekKey = formatDate(lastWeek);
    const lastWeekMenu = meals[lastWeekKey]?.menu || null;

    // 今月ランキング
    const currentMonth = today.getMonth();
    const monthlyCount = {};

    Object.entries(meals).forEach(([date, meal]) => {
        const d = new Date(date);
        if (d.getMonth() === currentMonth && meal.menu) {
            monthlyCount[meal.menu] = (monthlyCount[meal.menu] || 0) + 1;
        }
    });

    const ranking = Object.entries(monthlyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // -------------------------------
    // UIロジックここまで
    // -------------------------------


    // 日付クリック
    const handleDateClick = (date) => {
        if (date.getMonth() !== currentDate.getMonth()) return;
        setSelectedDate(date);
        const dateKey = formatDate(date);
        if (meals[dateKey]) setShowDetailModal(true);
        else setShowEntryModal(true);
    };

    // 食事保存
    const saveMeal = (mealData) => {
        const dateKey = formatDate(selectedDate);
        setMeals(prev => ({ ...prev, [dateKey]: mealData }));
        setShowEntryModal(false);
        setEditingMeal(null);
    };

    // 削除
    const deleteMeal = () => {
        const dateKey = formatDate(selectedDate);
        setMeals(prev => {
            const copy = { ...prev };
            delete copy[dateKey];
            return copy;
        });
        setShowDetailModal(false);
    };

    const startEdit = () => {
        const dateKey = formatDate(selectedDate);
        setEditingMeal(meals[dateKey]);
        setShowDetailModal(false);
        setShowEntryModal(true);
    };

    // 月移動
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

 // 検索（安全版）
const searchResults = searchQuery.trim()
    ? Object.entries(meals)
        .filter(([date, meal]) =>
            meal?.menu?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b[0].localeCompare(a[0]))
    : [];


    return (
        <div>

            {/* ここが “カレンダーより上に出す情報表示” */}
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
                                <div key={i}>
                                    {i + 1}位：{menu}（{count}回）
                                </div>
                            ))}
                    </div>
                </div>

            </div>

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
