import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { FarmSetupPage } from "./pages/FarmSetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IrrigationPage } from "./pages/IrrigationPage";
import { WeatherPage } from "./pages/WeatherPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { DevicesPage } from "./pages/DevicesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { FarmSettingsPage } from "./pages/FarmSettingsPage";
import { NavDemoPage } from "./pages/NavDemoPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { MarketplacePage } from "./pages/marketplace";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignUpPage },
      { path: "profile-setup", Component: ProfileSetupPage },
      { path: "farm-setup", Component: FarmSetupPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "irrigation", Component: IrrigationPage },
      { path: "weather", Component: WeatherPage },
      { path: "ai-assistant", Component: AIAssistantPage },
      { path: "devices", Component: DevicesPage },
      { path: "profile", Component: ProfilePage },
      { path: "edit-profile", Component: EditProfilePage },
      { path: "farm-settings", Component: FarmSettingsPage },
      { path: "nav-demo", Component: NavDemoPage },
      { path: "*", Component: NotFoundPage },
      { path: "marketplace", Component: MarketplacePage },
    ],
  },
]);