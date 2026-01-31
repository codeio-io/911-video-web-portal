import { useState } from "react";
import { StackedLayout } from "../ui/stacked-layout";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { Navbar, NavbarSection, NavbarSpacer, NavbarItem } from "../ui/navbar";
import { Text } from "../ui/text";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LanguagesList from "./LanguagesList";
import CallsHistory from "./CallsHistory";
import ProfileManagement from "./ProfileManagement";

function VideoIcon() {
  return (
    <svg
      data-slot="icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      data-slot="icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      data-slot="icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      data-slot="icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PowerOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path
        fillRule="evenodd"
        d="M10 2a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("languages");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "CU";

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white font-semibold">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-zinc-950 truncate">
              {user?.email || "Video Portal"}
            </div>
            <div className="text-xs text-zinc-500">Customer Video Portal</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection className="w-full">
          <SidebarItem
            current={activeSection === "languages"}
            onClick={() => setActiveSection("languages")}
          >
            <VideoIcon />
            <SidebarLabel>Languages</SidebarLabel>
          </SidebarItem>
          <SidebarItem
            current={activeSection === "history"}
            onClick={() => setActiveSection("history")}
          >
            <HistoryIcon />
            <SidebarLabel>Call History</SidebarLabel>
          </SidebarItem>
          <SidebarItem
            current={activeSection === "profile"}
            onClick={() => setActiveSection("profile")}
          >
            <UserIcon />
            <SidebarLabel>Profile</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all duration-200 px-4 py-2.5 font-medium"
        >
          <PowerOffIcon />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );

  const navbar = (
    <Navbar>
      <Text className="capitalize !text-gray-600 font-light text-sm">
        Customer Video Portal
      </Text>
    </Navbar>
  );

  return (
    <StackedLayout navbar={navbar} sidebar={sidebar}>
      {activeSection === "languages" && <LanguagesList />}
      {activeSection === "history" && <CallsHistory />}
      {activeSection === "profile" && <ProfileManagement />}
    </StackedLayout>
  );
}
