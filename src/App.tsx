import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/navigation/AppShell';

const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })));
const EncounterPage = lazy(() => import('./pages/EncounterPage').then((module) => ({ default: module.EncounterPage })));
const CodexPage = lazy(() => import('./pages/CodexPage').then((module) => ({ default: module.CodexPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((module) => ({ default: module.ReviewPage })));
const TrainingPage = lazy(() => import('./pages/TrainingPage').then((module) => ({ default: module.TrainingPage })));
const ProofPage = lazy(() => import('./pages/ProofPage').then((module) => ({ default: module.ProofPage })));
const MicroquestPage = lazy(() => import('./pages/MicroquestPage').then((module) => ({ default: module.MicroquestPage })));
const CampaignPage = lazy(() => import('./pages/CampaignPage').then((module) => ({ default: module.CampaignPage })));
const AnalyticalCampaignPage = lazy(() => import('./pages/AnalyticalCampaignPage').then((module) => ({ default: module.AnalyticalCampaignPage })));
const CoordinateLabPage = lazy(() => import('./pages/CoordinateLabPage').then((module) => ({ default: module.CoordinateLabPage })));
const OfficialQuest15Page = lazy(() => import('./pages/OfficialQuest15Page').then((module) => ({ default: module.OfficialQuest15Page })));
const VerticalSlicePage = lazy(() => import('./pages/VerticalSlicePage').then((module) => ({ default: module.VerticalSlicePage })));
const LineForgePage = lazy(() => import('./pages/LineForgePage').then((module) => ({ default: module.LineForgePage })));
const MetricModelingPage = lazy(() => import('./pages/MetricModelingPage').then((module) => ({ default: module.MetricModelingPage })));
const ParallelismLabPage = lazy(() => import('./pages/ParallelismLabPage').then((module) => ({ default: module.ParallelismLabPage })));
const CrossoverPage = lazy(() => import('./pages/CrossoverPage').then((module) => ({ default: module.CrossoverPage })));
const CorrespondenceLessonPage = lazy(() => import('./pages/CorrespondenceLessonPage').then((module) => ({ default: module.CorrespondenceLessonPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then((module) => ({ default: module.AchievementsPage })));

function PageLoader() {
  return <div className="page-loader" role="status">Abrindo território…</div>;
}

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="map" element={<MapPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="mission/ordered-correspondence" element={<CorrespondenceLessonPage />} />
          <Route path="encounter/official-q15" element={<OfficialQuest15Page />} />
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
          <Route path="lab/line-forge" element={<LineForgePage />} />
          <Route path="lab/exercise-48" element={<MetricModelingPage />} />
          <Route path="lab/parallelism" element={<ParallelismLabPage />} />
          <Route path="lab/crossover" element={<CrossoverPage />} />
          <Route path="vertical-slice" element={<VerticalSlicePage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="*" element={<Navigate to="/map" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
