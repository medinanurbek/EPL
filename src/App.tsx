import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Profile from '@/pages/user/Profile';
import Auth from '@/pages/Auth';
import Standings from '@/pages/Standings';
import Matches from '@/pages/Matches';
import Stats from '@/pages/Stats';
import Teams from '@/pages/Teams';
import TeamDetails from '@/pages/TeamDetails';
import TeamSquad from '@/pages/TeamSquad';
import Players from '@/pages/Players';
import PlayerDetails from '@/pages/PlayerDetails';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageTeams from '@/pages/admin/Teams';
import ManageMatches from '@/pages/admin/Matches';
import ManagePlayers from '@/pages/admin/Players';
import ManageReviews from '@/pages/admin/Reviews';

import AdminRoute from '@/components/auth/AdminRoute';
import { FavoritesProvider } from '@/context/FavoritesContext';

function App() {
    return (
        <BrowserRouter>
            <FavoritesProvider>
                <div className="flex flex-col min-h-screen bg-[#37003c] text-white">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/standings" element={<Standings />} />
                            <Route path="/matches" element={<Matches />} />
                            <Route path="/stats" element={<Stats />} />

                            <Route path="/teams" element={<Teams />} />
                            <Route path="/teams/:id" element={<TeamDetails />} />
                            <Route path="/teams/:teamId/squad" element={<TeamSquad />} />

                            <Route path="/players" element={<Players />} />
                            <Route path="/players/:playerId" element={<PlayerDetails />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                            <Route path="/admin/teams" element={<AdminRoute><ManageTeams /></AdminRoute>} />
                            <Route path="/admin/matches" element={<AdminRoute><ManageMatches /></AdminRoute>} />
                            <Route path="/admin/players" element={<AdminRoute><ManagePlayers /></AdminRoute>} />
                            <Route path="/admin/reviews" element={<AdminRoute><ManageReviews /></AdminRoute>} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </FavoritesProvider>
        </BrowserRouter>
    );
}

export default App;
