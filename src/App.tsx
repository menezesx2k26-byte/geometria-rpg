import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/navigation/AppShell';
import { CodexPage } from './pages/CodexPage';
import { EncounterPage } from './pages/EncounterPage';
import { MapPage } from './pages/MapPage';
import { ReviewPage } from './pages/ReviewPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProofPage } from './pages/ProofPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="encounter/:id" element={<EncounterPage />} />
        <Route path="codex" element={<CodexPage />} />
        <Route path="codex/:id" element={<CodexPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="proof/:id" element={<ProofPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Route>
    </Routes>
  );
}
