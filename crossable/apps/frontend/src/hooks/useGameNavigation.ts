import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { GameInfo } from "@/contexts/game";

// TODO: cleanup double definition
export const ROUTES = {
  HOME: "/",
  GAME: "/xword",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

interface UseGameNavigationOptions {
  game: GameInfo | null;
}

export function useGameNavigation({ game }: UseGameNavigationOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const previousGameRef = useRef<GameInfo | null>(null);

  useEffect(() => {
    console.log(
      "useGameNavigation: location=",
      location.pathname,
      " game=",
      game
    );

    // Only navigate on actual state changes, not on every render
    const gameChanged = previousGameRef.current !== game;
    if (!gameChanged) return;

    previousGameRef.current = game;

    // If we're in game screen but no longer have a game, go home
    if (location.pathname === ROUTES.GAME && game === null) {
      navigate(ROUTES.HOME, { replace: true });
    }
    // If we have a game but are on home screen, go to game
    else if (location.pathname === ROUTES.HOME && game !== null) {
      navigate(ROUTES.GAME, { replace: true });
    }
  }, [game, navigate, location.pathname]);
}
