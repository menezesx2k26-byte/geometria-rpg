import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/navigation/AppShell';
import { CodexPage } from './pages/CodexPage';
import { EncounterPage } from './pages/EncounterPage';
import { MapPage } from './pages/MapPage';
import { ReviewPage } from './pages/ReviewPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProofPage } from './pages/ProofPage';
import { MicroquestPage } from './pages/MicroquestPage';
import { CampaignPage } from './pages/CampaignPage';
import { AnalyticalCampaignPage } from './pages/AnalyticalCampaignPage';
import { CoordinateLabPage } from './pages/CoordinateLabPage';

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
        <Route path="microquest/:id" element={<MicroquestPage />} />
        <Route path="campaign/euclidean" element={<CampaignPage />} />
        <Route path="campaign/euclidean/:regionId" element={<CampaignPage />} />
        <Route path="campaign/euclidean/:regionId/:questId" element={<CampaignPage />} />
        <Route path="campaign/analytical" element={<AnalyticalCampaignPage />} />
        <Route path="campaign/analytical/:regionId" element={<AnalyticalCampaignPage />} />
        <Route path="campaign/analytical/:regionId/:questId" element={<AnalyticalCampaignPage />} />
        <Route path="lab/coordinates" element={<CoordinateLabPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Route>
    </Routes>
  );
}
