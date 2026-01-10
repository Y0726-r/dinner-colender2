function SearchBar({ query, setQuery, results, onResultClick }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                className="search-input"
                placeholder="メニュー名で検索"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {query && (
                <div className="search-results">
                    {results.length === 0 && (
                        <div className="search-no-result">該当なし🐰</div>
                    )}

                    {results.map(([date, meal]) => (
                        <div
                            key={date}
                            className="search-result-item"
                            onClick={() => onResultClick(date)}
                        >
                            <div className="search-result-date">{date}</div>
                            <div className="search-result-menu">{meal.menu}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// これが絶対必要！UMDでは "window.SearchBar" として公開する！
window.SearchBar = SearchBar;
