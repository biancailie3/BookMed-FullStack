import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './MedicPage.css';

function MedicPage() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const [medic, setMedic] = useState(null);
    const [ziSelectata, setZiSelectata] = useState(null);
    const [oraSelectata, setOraSelectata] = useState(null);
    const [oreOcupate, setOreOcupate] = useState([]);
    const [motiv, setMotiv] = useState('');
    const [salvat, setSalvat] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    // ── Recenzii ──
    const [reviews, setReviews] = useState([]);
    const [notaSelectata, setNotaSelectata] = useState(0);
    const [notaHover, setNotaHover] = useState(0);
    const [comentariu, setComentariu] = useState('');
    const [reviewTrimis, setReviewTrimis] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    // ── Data curentă — calculata o singura data, nu la fiecare render ──
    const azi = useRef(new Date());
    const ziuaAzi  = azi.current.getDate();
    const lunaAzi  = azi.current.getMonth();
    const anAzi    = azi.current.getFullYear();
    const oraAzi   = azi.current.getHours(); // ← ora curentă

    const [calendarLuna, setCalendarLuna] = useState(lunaAzi);
    const [calendarAn,   setCalendarAn]   = useState(anAzi);

    const numeleLunii = [
        'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
        'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'
    ];

    // ── Fetch medic + recenzii ──
    const fetchReviews = () => {
        fetch(`http://localhost:4000/api/medici/${id}/reviews`)
            .then(res => res.json())
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(err => console.error("Eroare reviews:", err));
    };

    useEffect(() => {
        fetch(`http://localhost:4000/api/medici/${id}`)
            .then(res => res.json())
            .then(data => setMedic(data))
            .catch(err => console.error("Eroare medic:", err));
        fetchReviews();
    }, [id]);

    // ── Navigare calendar ──
    const mergiLunaInainte = () => {
        setCalendarLuna(l => {
            if (l === 11) { setCalendarAn(a => a + 1); return 0; }
            return l + 1;
        });
        setZiSelectata(null);
        setOraSelectata(null);
    };

    const mergiLunaInapoi = () => {
        if (calendarAn === anAzi && calendarLuna === lunaAzi) return;
        setCalendarLuna(l => {
            if (l === 0) { setCalendarAn(a => a - 1); return 11; }
            return l - 1;
        });
        setZiSelectata(null);
        setOraSelectata(null);
    };

    // ── Helpers calendar ──
    const genereazaZileLuna = () => {
        const ultimaZi = new Date(calendarAn, calendarLuna + 1, 0).getDate();
        return Array.from({ length: ultimaZi }, (_, i) => i + 1);
    };

    const esteInactiva = (zi) => {
        const aTrecut = calendarAn === anAzi && calendarLuna === lunaAzi && zi < ziuaAzi;
        const ziuaSaptamanii = new Date(calendarAn, calendarLuna, zi).getDay();
        if (aTrecut || ziuaSaptamanii === 0 || ziuaSaptamanii === 6) return true;

        // Dacă e ziua de azi, verificăm dacă mai există sloturi după ora curentă
        const eAzi = calendarAn === anAzi && calendarLuna === lunaAzi && zi === ziuaAzi;
        if (eAzi && medic?.program) {
            const oraSfarsit = parseInt(medic.program.oraSfarsit.split(':')[0], 10);
            // Nu mai sunt sloturi dacă ora curentă >= ultima oră din program
            if (oraAzi >= oraSfarsit - 1) return true;
        }

        return false;
    };

    const genereazaSpatiiGoale = () => {
        const primaZi = new Date(calendarAn, calendarLuna, 1).getDay();
        const offset  = primaZi === 0 ? 6 : primaZi - 1;
        return Array.from({ length: offset }, (_, i) => (
            <div key={`empty-${i}`} className="zi empty" />
        ));
    };

    // ── Time slots ──
    const genereazaTimeSlots = () => {
        if (!medic?.program) return [];
        const oraStart   = parseInt(medic.program.oraStart.split(':')[0], 10);
        const oraSfarsit = parseInt(medic.program.oraSfarsit.split(':')[0], 10);
        const slots = [];
        for (let ora = oraStart; ora < oraSfarsit; ora++) {
            slots.push(`${ora.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    // ── Filtrare time slots: exclude ocupate + orele trecute dacă e azi ──
    const slotDisponibil = (ora) => {
        if (oreOcupate.includes(ora)) return false;
        const eAziSelectat = calendarAn === anAzi
            && calendarLuna === lunaAzi
            && ziSelectata === ziuaAzi;
        if (eAziSelectat) {
            const oraSlot = parseInt(ora.split(':')[0], 10);
            if (oraSlot <= oraAzi) return false; // exclude ora curentă și cele trecute
        }
        return true;
    };

    // ── Selectare zi ──
    const handleZiSelectata = async (zi) => {
        setZiSelectata(zi);
        setOraSelectata(null);
        try {
            const luna  = String(calendarLuna + 1).padStart(2, '0');
            const ziStr = String(zi).padStart(2, '0');
            const dataStr = `${calendarAn}-${luna}-${ziStr}`;
            const res = await fetch(`http://localhost:4000/api/programari/ocupate/${id}/${dataStr}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const ore = await res.json();
            setOreOcupate(Array.isArray(ore) ? ore : []);
        } catch (err) {
            console.error("Eroare ore ocupate:", err);
            setOreOcupate([]);
        }
    };

    // ── Confirmare programare ──
    const handleConfirmare = async () => {
        if (!motiv.trim()) {
            alert("Te rugăm să completezi motivul consultației.");
            return;
        }
        setLoadingSubmit(true);
        const programare = {
            pacient: user.id,
            medic: id,
            data: new Date(calendarAn, calendarLuna, ziSelectata),
            ora: oraSelectata,
            motiv: motiv.trim(),
        };
        try {
            const res = await fetch('http://localhost:4000/api/programari', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(programare),
            });
            await res.json();
            setSalvat(true);
        } catch (err) {
            console.error("Eroare:", err);
            alert("A apărut o eroare. Încearcă din nou.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    // ── Review ──
    const handleTrimiteReview = async () => {
        if (!notaSelectata) { alert("Te rugăm să selectezi o notă."); return; }
        if (!comentariu.trim()) { alert("Te rugăm să scrii un comentariu."); return; }
        setLoadingReview(true);
        try {
            await fetch(`http://localhost:4000/api/medici/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeUtilizator: user?.nume || 'Pacient anonim',
                    comentariu: comentariu.trim(),
                    nota: notaSelectata,
                }),
            });
            setReviewTrimis(true);
            setComentariu('');
            setNotaSelectata(0);
            fetchReviews();
            fetch(`http://localhost:4000/api/medici/${id}`)
                .then(res => res.json())
                .then(data => setMedic(data));
        } catch (err) {
            console.error("Eroare:", err);
            alert("A apărut o eroare. Încearcă din nou.");
        } finally {
            setLoadingReview(false);
        }
    };

    // ── Helpers UI ──
    const renderStele = (nota, marime = 'normal') => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`stea ${marime} ${i < Math.round(nota) ? 'activa' : ''}`}>★</span>
        ));
    };

    const formatData = (dataStr) => {
        const d = new Date(dataStr);
        return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // ── Guards ──
    if (!medic) return (
        <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Se încarcă...</p>
        </div>
    );

    if (salvat) return (
        <div className="success-screen">
            <div className="success-ornament">✦</div>
            <h2>Programare salvată</h2>
            <p>Te așteptăm pe <strong>{ziSelectata} {numeleLunii[calendarLuna]}</strong> la ora <strong>{oraSelectata}</strong>.</p>
            <p className="success-sub">Vei primi o confirmare în curând.</p>
        </div>
    );

    return (
        <div className="medic-page-wrapper">

            {/* ── Doctor Hero ── */}
            <div className="doctor-hero">
                <div className="hero-ornament top-left" />
                <div className="hero-ornament bottom-right" />

                <div className="doctor-photo-col">
                    <img
                        src={medic.poza || "https://via.placeholder.com/600x800?text=Medic"}
                        alt={`Dr. ${medic.nume}`}
                        className="doctor-photo"
                        onError={e => { e.target.src = "https://via.placeholder.com/600x800?text=Medic"; }}
                    />
                </div>

                <div className="doctor-info">
                    <span className="specialitate-badge">{medic.specialitate}</span>
                    <h1 className="doctor-name">Dr. {medic.nume}</h1>
                    <div className="gold-divider">
                        <span className="gold-line" />
                        <span className="gold-diamond">◆</span>
                        <span className="gold-line" />
                    </div>
                    <div className="doctor-meta">
                        <span className="meta-chip">📍 {medic.locatie}</span>
                        <span className="meta-chip">💰 {medic.pretConsultatie} € / consultație</span>
                        <span className="meta-chip">🕐 {medic.program.oraStart} – {medic.program.oraSfarsit}</span>
                    </div>

                    {medic.rating > 0 && (
                        <div className="hero-rating">
                            <div className="hero-stele">
                                {renderStele(medic.rating, 'mare')}
                            </div>
                            <span className="hero-rating-text">
                                {medic.rating.toFixed(1)} <em>({medic.numarReviewuri} {medic.numarReviewuri === 1 ? 'recenzie' : 'recenzii'})</em>
                            </span>
                        </div>
                    )}

                    <p className="doctor-tagline">
                        Alege ziua și ora potrivite pentru tine și doctorul tău.<br />
                        Completează detaliile și apasă <em>Salvează</em> pentru a finaliza programarea.
                    </p>
                </div>
            </div>

            {/* ── booking stanga, recenzii dreapta ── */}
            <div className="content-columns">

                <div className="booking-flow">

                    <div className="step-card">
                        <div className="step-header">
                            <span className="step-number">1</span>
                            <div>
                                <h3 className="step-title">Alege o zi</h3>
                                <p className="step-hint">Zilele indisponibile sunt marcate automat în funcție de programul doctorului</p>
                            </div>
                        </div>

                        <div className="calendar-container">
                            <div className="calendar-nav">
                                <button
                                    className="nav-arrow"
                                    onClick={mergiLunaInapoi}
                                    disabled={calendarAn === anAzi && calendarLuna === lunaAzi}
                                    aria-label="Luna anterioară"
                                >‹</button>
                                <div className="calendar-month-label">
                                    {numeleLunii[calendarLuna]} {calendarAn}
                                </div>
                                <button
                                    className="nav-arrow"
                                    onClick={mergiLunaInainte}
                                    aria-label="Luna următoare"
                                >›</button>
                            </div>
                            <div className="calendar-header">
                                {['Lun','Mar','Mie','Joi','Vin','Sam','Dum'].map(z => (
                                    <span key={z}>{z}</span>
                                ))}
                            </div>
                            <div className="calendar-grid">
                                {genereazaSpatiiGoale()}
                                {genereazaZileLuna().map(zi => {
                                    const inactiva = esteInactiva(zi);
                                    const eAzi = zi === ziuaAzi && calendarLuna === lunaAzi && calendarAn === anAzi;
                                    return (
                                        <button
                                            key={zi}
                                            className={`zi ${ziSelectata === zi ? 'active' : ''} ${inactiva ? 'inactiva' : ''} ${eAzi ? 'azi' : ''}`}
                                            onClick={() => !inactiva && handleZiSelectata(zi)}
                                            disabled={inactiva}
                                        >
                                            {zi}
                                            {eAzi && <span className="azi-dot" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* – Time slots */}
                    {ziSelectata && (
                        <div className="step-card fade-in">
                            <div className="step-header">
                                <span className="step-number">2</span>
                                <div>
                                    <h3 className="step-title">Alege ora</h3>
                                    <p className="step-hint">
                                        Ore disponibile pentru {ziSelectata} {numeleLunii[calendarLuna]}
                                    </p>
                                </div>
                            </div>
                            <div className="time-slots">
                                {genereazaTimeSlots()
                                    .filter(slotDisponibil)
                                    .map(ora => (
                                        <button
                                            key={ora}
                                            className={`time-button ${oraSelectata === ora ? 'active' : ''}`}
                                            onClick={() => setOraSelectata(ora)}
                                        >
                                            {ora}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {/* Motiv + Confirmare */}
                    {ziSelectata && oraSelectata && (
                        <div className="step-card fade-in">
                            <div className="step-header">
                                <span className="step-number">3</span>
                                <div>
                                    <h3 className="step-title">Detalii consultație</h3>
                                    <p className="step-hint">Ajută-ne să înțelegem mai bine motivul vizitei tale</p>
                                </div>
                            </div>

                            <div className="motiv-wrap">
                                <label className="motiv-label">Motivul consultației</label>
                                <textarea
                                    className="motiv-textarea"
                                    placeholder="Ex: Dureri de spate, control periodic, reînnoire rețetă..."
                                    value={motiv}
                                    onChange={e => setMotiv(e.target.value)}
                                    rows={4}
                                    maxLength={500}
                                />
                                <span className="motiv-count">{motiv.length} / 500</span>
                            </div>

                            <div className="rezumat">
                                <div className="rezumat-row">
                                    <span>📅 Data</span>
                                    <strong>{ziSelectata} {numeleLunii[calendarLuna]} {calendarAn}</strong>
                                </div>
                                <div className="rezumat-row">
                                    <span>🕐 Ora</span>
                                    <strong>{oraSelectata}</strong>
                                </div>
                                <div className="rezumat-row">
                                    <span>👨‍⚕️ Doctor</span>
                                    <strong>Dr. {medic.nume}</strong>
                                </div>
                                <div className="rezumat-row">
                                    <span>💰 Preț</span>
                                    <strong>{medic.pretConsultatie} €</strong>
                                </div>
                            </div>

                            <button
                                className={`confirm-btn ${loadingSubmit ? 'loading' : ''}`}
                                onClick={handleConfirmare}
                                disabled={loadingSubmit}
                            >
                                {loadingSubmit ? 'Se salvează...' : 'Salvează programarea ◆'}
                            </button>
                            <p className="confirm-hint">
                                Prin apăsarea butonului confirmi că ești de acord cu termenii BookMed.
                            </p>
                        </div>
                    )}

                </div>

                {/* sectiune recenzii */}
                <div className="reviews-section">

                    {reviews.length > 0 && (
                        <div className="reviews-sumar">
                            <div className="sumar-nota-mare">
                                {medic.rating?.toFixed(1) || '—'}
                            </div>
                            <div className="sumar-dreapta">
                                <div className="sumar-stele">
                                    {renderStele(medic.rating || 0, 'mare')}
                                </div>
                                <p className="sumar-text">
                                    Bazat pe {reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="review-form-card">
                        <div className="step-header">
                            <span className="step-number">✦</span>
                            <div>
                                <h3 className="step-title">Adaugă o recenzie</h3>
                                <p className="step-hint">Experiența ta îi ajută pe alți pacienți să aleagă</p>
                            </div>
                        </div>

                        {reviewTrimis ? (
                            <div className="review-succes">
                                <span className="review-succes-icon">✦</span>
                                <p>Mulțumim pentru recenzie!</p>
                                <button className="review-succes-btn" onClick={() => setReviewTrimis(false)}>
                                    Adaugă alta
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="stele-selectare-wrap">
                                    <label className="motiv-label">Nota ta</label>
                                    <div className="stele-selectare">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <button
                                                key={i}
                                                className={`stea-btn ${i < (notaHover || notaSelectata) ? 'activa' : ''}`}
                                                onMouseEnter={() => setNotaHover(i + 1)}
                                                onMouseLeave={() => setNotaHover(0)}
                                                onClick={() => setNotaSelectata(i + 1)}
                                                aria-label={`${i + 1} stele`}
                                            >★</button>
                                        ))}
                                        {notaSelectata > 0 && (
                                            <span className="nota-label">
                                                {['', 'Slab', 'Acceptabil', 'Bun', 'Foarte bun', 'Excelent'][notaSelectata]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="motiv-wrap">
                                    <label className="motiv-label">Comentariul tău</label>
                                    <textarea
                                        className="motiv-textarea"
                                        placeholder="Descrie experiența ta cu acest doctor..."
                                        value={comentariu}
                                        onChange={e => setComentariu(e.target.value)}
                                        rows={4}
                                        maxLength={600}
                                    />
                                    <span className="motiv-count">{comentariu.length} / 600</span>
                                </div>

                                <button
                                    className={`confirm-btn ${loadingReview ? 'loading' : ''}`}
                                    onClick={handleTrimiteReview}
                                    disabled={loadingReview}
                                >
                                    {loadingReview ? 'Se salvează...' : 'Salvează recenzia ◆'}
                                </button>
                            </>
                        )}
                    </div>

                    {reviews.length > 0 && (
                        <div className="reviews-lista">
                            <h3 className="reviews-lista-titlu">Ce spun pacienții</h3>
                            {reviews.map((r, i) => (
                                <div key={i} className="review-card fade-in">
                                    <div className="review-card-top">
                                        <div className="review-avatar">
                                            {(r.numeUtilizator || 'P')[0].toUpperCase()}
                                        </div>
                                        <div className="review-meta">
                                            <strong className="review-nume">{r.numeUtilizator || 'Pacient anonim'}</strong>
                                            <span className="review-data">{formatData(r.data)}</span>
                                        </div>
                                        <div className="review-stele">
                                            {renderStele(r.nota)}
                                        </div>
                                    </div>
                                    <p className="review-comentariu">{r.comentariu}</p>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default MedicPage;
