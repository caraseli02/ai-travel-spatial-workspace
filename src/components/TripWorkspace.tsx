import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripWorkspacePresenter from "./TripWorkspacePresenter";
import type { Trip } from "../models/trip";
import { localTripRepository } from "../models/tripRepository";

export default function TripWorkspace() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const showOnboardingToast = useMemo(
    () => new URLSearchParams(location.search).get('onboarding') === '1',
    [location.search],
  );
  const [isMobile, setIsMobile] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!tripId) {
      setNotFound(true);
      return;
    }
    const loaded = localTripRepository.load(tripId);
    if (!loaded) {
      setNotFound(true);
      return;
    }
    setTrip(loaded);
  }, [tripId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    if (window.innerWidth < 768) {
      setInboxOpen(false);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (notFound) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-lg text-muted-foreground">Trip not found</p>
          <Button onClick={() => navigate("/trips")}>Back to trips</Button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Compass size={16} className="animate-spin" />
          <span className="text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <TripWorkspacePresenter
      trip={trip}
      isMobile={isMobile}
      inboxOpen={inboxOpen}
      setInboxOpen={setInboxOpen}
      navigate={navigate}
      showOnboardingToast={showOnboardingToast}
    />
  );
}
