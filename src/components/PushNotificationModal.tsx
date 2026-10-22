import React, { useState } from 'react';
import { FamilyMember, Chore, InAppNotification } from '../types/index.ts';
import { generateDailyNotificationMessage } from '../utils/rules.ts';
import { sendBrowserNotification, requestNotificationPermission } from '../services/notificationService.ts';
import { Bell, Send, CheckCircle2, Clock, Smartphone, Volume2, ShieldAlert, X } from 'lucide-react';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  chores: Chore[];
  onAddInAppNotification: (notif: InAppNotification) => void;
  onUpdateMemberNotificationTime: (memberId: string, time: string, enabled: boolean) => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  members,
  chores,
  onAddInAppNotification,
  onUpdateMemberNotificationTime,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [testSentSuccess, setTestSentSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const previewMessage = selectedMember
    ? generateDailyNotificationMessage(selectedMember, chores)
    : null;

  const handleSendNotificationToMember = (member: FamilyMember) => {
    const msg = generateDailyNotificationMessage(member, chores);

    // Browser native push notification
    const pushed = sendBrowserNotification(msg.title, {
      body: msg.body,
      tag: `daily-reminder-${member.id}`,
    });

    // In-app notification center
    const inAppNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      memberId: member.id,
      title: msg.title,
      message: msg.body,
      timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'daily_reminder',
    };
    onAddInAppNotification(inAppNotif);

    setTestSentSuccess(
      pushed
        ? `Böngésző push és belső értesítés elküldve ${member.name} részére!`
        : `Belső értesítés elküldve ${member.name} részére! (Böngésző push: ${
            permission === 'granted' ? 'Elküldve' : 'Nincs engedélyezve a böngészőben'
          })`
    );

    setTimeout(() => {
      setTestSentSuccess(null);
    }, 4000);
  };

  const handleSendToAllMembers = () => {
    let sentCount = 0;
    members.forEach((member) => {
      const msg = generateDailyNotificationMessage(member, chores);
      sendBrowserNotification(msg.title, {
        body: msg.body,
        tag: `daily-${member.id}-${Date.now()}`,
      });

      onAddInAppNotification({
        id: `notif-all-${Date.now()}-${member.id}`,
        memberId: member.id,
        title: msg.title,
        message: msg.body,
        timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'daily_reminder',
      });
      sentCount++;
    });

    setTestSentSuccess(`Napi push értesítés elküldve mind a ${sentCount} családtagnak!`);
    setTimeout(() => setTestSentSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Napi Push Értesítések Kezelése</h2>
              <p className="text-xs text-indigo-100">
                Automatikus és kézi napi emlékeztetők a családtagok feladatairól
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Permission Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Böngésző Push értesítési jogosultság
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Állapot:{' '}
                  {permission === 'granted' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Engedélyezve
                    </span>
                  ) : permission === 'denied' ? (
                    <span className="text-rose-600 font-medium">Letiltva a böngészőben</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Még nincs engedélyezve</span>
                  )}
                </p>
              </div>
            </div>

            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                Push engedély kérése
              </button>
            )}
          </div>

          {testSentSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSentSuccess}</span>
            </div>
          )}

          {/* Broadcast to all */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-indigo-900">
                Reggeli napi összesítés küldése mindenkinek
              </h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Egyetlen kattintással elküldi a mai napi teendőket az összes családtag készülékére.
              </p>
            </div>
            <button
              onClick={handleSendToAllMembers}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Összes tagnak küldés
            </button>
          </div>

          {/* Individual Member Settings & Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Családtagok értesítési ideje és üzenet előnézet
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Member Selector List */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">
                  Válassz családtagot teszteléshez:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedMemberId === member.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{member.avatar}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={member.notificationTime || '08:00'}
                          onChange={(e) =>
                            onUpdateMemberNotificationTime(
                              member.id,
                              e.target.value,
                              member.notificationsEnabled
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 text-xs font-mono border rounded-md border-slate-300 bg-white"
                          title="Napi emlékeztető ideje"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" /> Push értesítés minta
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                      Ma: {todayStr}
                    </span>
                  </div>

                  {previewMessage ? (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        <h4 className="text-sm font-bold text-slate-900">{previewMessage.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {previewMessage.body}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Családi Házimunka App</span>
                        <span>Éppen most</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Nincs kiválasztott tag</p>
                  )}
                </div>

                {selectedMember && (
                  <button
                    onClick={() => handleSendNotificationToMember(selectedMember)}
                    className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Értesítés küldése {selectedMember.name} részére most
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Rendben, bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
