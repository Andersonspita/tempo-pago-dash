import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { TimeEntryList } from "@/components/TimeEntryList";
import { Settings } from "@/components/Settings";
import { TimeEntry } from "@/types/timesheet";

type ViewType = "dashboard" | "form" | "list" | "settings";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setCurrentView("form");
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setCurrentView("form");
  };

  const handleBackToDashboard = () => {
    setEditingEntry(null);
    setCurrentView("dashboard");
  };

  const handleViewEntries = () => {
    setCurrentView("list");
  };

  const handleSettings = () => {
    setCurrentView("settings");
  };

  switch (currentView) {
    case "form":
      return (
        <TimeEntryForm 
          onBack={handleBackToDashboard}
          editEntry={editingEntry}
        />
      );
    
    case "list":
      return (
        <TimeEntryList 
          onBack={handleBackToDashboard}
          onEdit={handleEditEntry}
        />
      );
    
    case "settings":
      return (
        <Settings onBack={handleBackToDashboard} />
      );
    
    default:
      return (
        <Dashboard 
          onAddEntry={handleAddEntry}
          onViewEntries={handleViewEntries}
          onSettings={handleSettings}
        />
      );
  }
};

export default Index;