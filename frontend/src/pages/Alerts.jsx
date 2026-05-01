'use client';

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Layout from "../components/layout";
import AlertNotif from "../components/AlertNotif";
import EmailModal from "../components/EmailModal";
import SoundModal from "../components/SoundModal";

export default function Alerts() {
  const [showEmail, setShowEmail] = useState(false);
  const [showSound, setShowSound] = useState(false);

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            onEmailClick={() => setShowEmail(true)}
            onSoundClick={() => setShowSound(true)}
          />

          <div className="flex-1 overflow-auto p-6">
            <AlertNotif />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEmail && (
        <EmailModal
          onClose={() => setShowEmail(false)}
          onSave={() => setShowEmail(false)}
        />
      )}
      {showSound && (
        <SoundModal
          onClose={() => setShowSound(false)}
          onSave={() => setShowSound(false)}
        />
      )}

    </Layout>
  );
}

