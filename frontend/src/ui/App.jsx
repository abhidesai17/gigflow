import { Route, Routes, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';

import { fetchGigs, createGig } from '../store/slices/gigsSlice';
import { createBid, fetchBidsForGig, hireBid } from '../store/slices/bidsSlice';
import { loginUser, logoutUser, registerUser, setUser, logout } from '../store/slices/authSlice';
import { pushNotification } from '../store/slices/notificationsSlice';

import { createSocket } from './socket';

function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const notifications = useSelector((s) => s.notifications.items);

  async function onLogout() {
    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      localStorage.removeItem('gigflow_user');
      dispatch(logout());
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            GigFlow
          </Link>
          <nav className="flex items-center gap-3">
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600" to="/">
              Gigs
            </Link>
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600" to="/gigs/new">
              Post a gig
            </Link>
            {!user ? (
              <>
                <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600" to="/login">
                  Login
                </Link>
                <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {notifications.length > 0 ? (
          <div className="mb-4 space-y-2">
            {notifications.map((n, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 shadow-sm"
              >
                {n.message}
              </div>
            ))}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      {children}
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ease-out focus:border-indigo-600/40 focus:ring-2 focus:ring-indigo-500/30 ${
        props.className || ''
      }`}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ease-out focus:border-indigo-600/40 focus:ring-2 focus:ring-indigo-500/30 ${
        props.className || ''
      }`}
    />
  );
}

function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 ${
        props.className || ''
      }`}
    >
      {children}
    </button>
  );
}

function RequireAuth({ children }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const user = await dispatch(loginUser({ email, password })).unwrap();
    localStorage.setItem('gigflow_user', JSON.stringify(user));
    navigate('/');
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Login</h1>
      <p className="mb-5 text-sm text-slate-600">Use your email and password.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <TextInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        {authError ? <div className="text-sm text-rose-700">{authError}</div> : null}
        <Button disabled={authStatus === 'loading'} type="submit">
          {authStatus === 'loading' ? 'Signing in...' : 'Login'}
        </Button>
      </form>
    </Card>
  );
}

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((s) => s.auth.status);
  const authError = useSelector((s) => s.auth.error);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const user = await dispatch(registerUser({ name, email, password })).unwrap();
    localStorage.setItem('gigflow_user', JSON.stringify(user));
    navigate('/');
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Create account</h1>
      <p className="mb-5 text-sm text-slate-600">Register to post gigs and bid.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <TextInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        {authError ? <div className="text-sm text-rose-700">{authError}</div> : null}
        <Button disabled={authStatus === 'loading'} type="submit">
          {authStatus === 'loading' ? 'Creating...' : 'Register'}
        </Button>
      </form>
    </Card>
  );
}

function GigsPage() {
  const dispatch = useDispatch();
  const gigs = useSelector((s) => s.gigs.items);
  const status = useSelector((s) => s.gigs.status);
  const error = useSelector((s) => s.gigs.error);

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchGigs({ search: '' }));
  }, [dispatch]);

  async function onSearch(e) {
    e.preventDefault();
    dispatch(fetchGigs({ search }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Search gigs by title</label>
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Build a landing page" />
          </div>
          <Button type="submit" disabled={status === 'loading'}>
            Search
          </Button>
        </form>
        {error ? <div className="mt-3 text-sm text-rose-700">{error}</div> : null}
      </Card>

      <div className="grid gap-3">
        {gigs.map((g) => (
          <Card key={g._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{g.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{g.description}</p>
                <p className="mt-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Budget:</span> ${g.budget}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700" to={`/gigs/${g._id}`}>
                  View
                </Link>
                <Link
                  className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
                  to={`/gigs/${g._id}/bids`}
                >
                  Review bids
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {gigs.length === 0 && status !== 'loading' ? (
          <div className="text-sm text-slate-600">No open gigs found.</div>
        ) : null}
      </div>
    </div>
  );
}

function NewGigPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(createGig({ title, description, budget: Number(budget) })).unwrap();
      navigate('/');
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">Post a gig</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <TextArea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Budget (USD)</label>
          <TextInput value={budget} onChange={(e) => setBudget(e.target.value)} type="number" min="0" />
        </div>
        {error ? <div className="text-sm text-rose-700">{error}</div> : null}
        <Button type="submit">Create gig</Button>
      </form>
    </Card>
  );
}

function GigDetailPage() {
  const { gigId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const gig = useSelector((s) => s.gigs.items.find((g) => g._id === gigId));
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gig) dispatch(fetchGigs({ search: '' }));
  }, [dispatch, gig]);

  async function onBid(e) {
    e.preventDefault();
    setError(null);
    setStatus('loading');

    try {
      await dispatch(createBid({ gigId, message, proposedPrice: Number(proposedPrice) })).unwrap();
      setStatus('succeeded');
      setMessage('');
      setProposedPrice('');
    } catch (e2) {
      setError(e2.message);
      setStatus('failed');
    }
  }

  if (!gig) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{gig.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{gig.description}</p>
        <p className="mt-4 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Budget:</span> ${gig.budget}
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">Submit a bid</h2>
        {!user ? <div className="mb-4 text-sm text-slate-600">Login to place a bid.</div> : null}
        <form onSubmit={onBid} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
            <TextArea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} disabled={!user} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Proposed price</label>
            <TextInput
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              type="number"
              min="0"
              disabled={!user}
            />
          </div>
          {error ? <div className="text-sm text-rose-700">{error}</div> : null}
          <Button type="submit" disabled={!user || status === 'loading'}>
            {status === 'loading' ? 'Submitting...' : 'Submit bid'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function GigBidsPage() {
  const { gigId } = useParams();
  const dispatch = useDispatch();

  const bids = useSelector((s) => s.bids.byGigId[gigId] || []);
  const status = useSelector((s) => s.bids.status);
  const error = useSelector((s) => s.bids.error);

  const isGigAssigned = bids.some((b) => b.status === 'hired');

  useEffect(() => {
    dispatch(fetchBidsForGig(gigId));
  }, [dispatch, gigId]);

  async function onHire(bidId) {
    try {
      await dispatch(hireBid(bidId)).unwrap();
      await dispatch(fetchBidsForGig(gigId));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[GigFlow] Hire failed', e);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Bids</h1>
        <p className="mt-1 text-sm text-slate-600">Only the gig owner can access this page.</p>
        {error ? <div className="mt-3 text-sm text-rose-700">{error}</div> : null}
      </Card>

      <div className="grid gap-3">
        {bids.map((b) => (
          <Card key={b._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">Proposed price</p>
                <p className="text-lg font-semibold tracking-tight text-slate-900">${b.proposedPrice}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.message}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      b.status === 'pending'
                        ? 'bg-slate-100 text-slate-600'
                        : b.status === 'hired'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => onHire(b._id)}
                  disabled={status === 'loading' || isGigAssigned || b.status !== 'pending'}
                >
                  Hire
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {bids.length === 0 && status !== 'loading' ? (
          <div className="text-sm text-slate-600">No bids yet.</div>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    const raw = localStorage.getItem('gigflow_user');
    if (!raw) return;
    try {
      dispatch(setUser(JSON.parse(raw)));
    } catch {
      // ignore
    }
  }, [dispatch]);

  const socket = useMemo(() => createSocket(), []);

  useEffect(() => {
    socket.on('notification', (payload) => {
      dispatch(pushNotification(payload));
    });

    return () => {
      socket.off('notification');
    };
  }, [dispatch, socket]);

  useEffect(() => {
    if (user?.id) {
      socket.emit('auth:identify', { userId: user.id });
    }
  }, [socket, user]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GigsPage />} />
        <Route
          path="/gigs/new"
          element={
            <RequireAuth>
              <NewGigPage />
            </RequireAuth>
          }
        />
        <Route path="/gigs/:gigId" element={<GigDetailPage />} />
        <Route
          path="/gigs/:gigId/bids"
          element={
            <RequireAuth>
              <GigBidsPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
