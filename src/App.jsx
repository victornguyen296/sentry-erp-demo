import React, { useState } from "react";
import {
  LayoutDashboard, Package, CalendarDays, Wallet, Laptop, Settings2,
  CheckCircle2, XCircle, Clock, Plus, Trash2, ArrowUp, ArrowDown,
  Building2, ChevronLeft, X, MessageSquare, PlayCircle, Sparkles,
  ArrowRight, FileText, RotateCcw
} from "lucide-react";

const BUILDINGS = ["Sonatus", "TSC", "TSP", "TSZ", "Orbital 1", "Orbital 2"];

const ICONS = { Package, CalendarDays, Wallet, Laptop, Settings2 };

const uid = () => Math.random().toString(36).slice(2, 9);

const seedFlows = () => ([
  {
    id: "purchase",
    name: "Đề xuất mua hàng",
    icon: "Package",
    desc: "Mua sắm vật tư, dụng cụ văn phòng, hàng hóa vận hành tòa nhà",
    accent: "amber",
    fields: { amount: true, building: true },
    steps: [
      { id: uid(), name: "Trưởng bộ phận duyệt", role: "Trưởng bộ phận", approver: "Trần Thị Bích", enabled: true },
      { id: uid(), name: "Kế toán kiểm tra ngân sách", role: "Kế toán", approver: "Lê Văn Cường", enabled: true },
      { id: uid(), name: "Ban Giám đốc phê duyệt", role: "Ban Giám đốc", approver: "Nguyễn Văn Đức", enabled: true },
    ],
  },
  {
    id: "leave",
    name: "Đề xuất nghỉ phép",
    icon: "CalendarDays",
    desc: "Xin nghỉ phép năm, nghỉ việc riêng cho nhân sự tại các tòa nhà",
    accent: "teal",
    fields: { building: true, dates: true },
    steps: [
      { id: uid(), name: "Quản lý trực tiếp duyệt", role: "Quản lý trực tiếp", approver: "Phạm Thị Hoa", enabled: true },
      { id: uid(), name: "HR xác nhận phép còn lại", role: "Nhân sự (HR)", approver: "Đỗ Minh Anh", enabled: true },
    ],
  },
  {
    id: "payment",
    name: "Đề xuất tạm ứng / thanh toán",
    icon: "Wallet",
    desc: "Tạm ứng công tác, thanh toán chi phí vận hành, hợp đồng vendor",
    accent: "rose",
    fields: { amount: true, building: true },
    steps: [
      { id: uid(), name: "Trưởng bộ phận duyệt", role: "Trưởng bộ phận", approver: "Trần Thị Bích", enabled: true },
      { id: uid(), name: "Kế toán trưởng duyệt", role: "Kế toán trưởng", approver: "Vũ Thị Lan", enabled: true },
      { id: uid(), name: "Giám đốc Tài chính phê duyệt", role: "Giám đốc Tài chính", approver: "Hoàng Minh Tuấn", enabled: true },
    ],
  },
  {
    id: "itasset",
    name: "Đề xuất mua sắm thiết bị IT",
    icon: "Laptop",
    desc: "Laptop, license phần mềm, thiết bị mạng cho nhân viên & tòa nhà",
    accent: "indigo",
    fields: { amount: true, building: true },
    steps: [
      { id: uid(), name: "IT Manager duyệt kỹ thuật", role: "IT Manager", approver: "Nguyễn Đỗ Huy Hoàng", enabled: true },
      { id: uid(), name: "Kế toán duyệt ngân sách", role: "Kế toán", approver: "Lê Văn Cường", enabled: true },
      { id: uid(), name: "Ban Giám đốc phê duyệt cuối", role: "Ban Giám đốc", approver: "Nguyễn Văn Đức", enabled: true },
    ],
  },
  {
    id: "custom",
    name: "Flow tùy chỉnh",
    icon: "Settings2",
    desc: "Tạo mới một quy trình phê duyệt theo đúng nhu cầu công ty",
    accent: "stone",
    fields: { amount: true, building: true },
    steps: [],
    isCustom: true,
  },
]);

const accentMap = {
  amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", soft: "bg-amber-50", ring: "ring-amber-500" },
  teal: { bg: "bg-teal-600", text: "text-teal-700", border: "border-teal-600", soft: "bg-teal-50", ring: "ring-teal-600" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-500", soft: "bg-rose-50", ring: "ring-rose-500" },
  indigo: { bg: "bg-indigo-600", text: "text-indigo-700", border: "border-indigo-600", soft: "bg-indigo-50", ring: "ring-indigo-600" },
  stone: { bg: "bg-stone-700", text: "text-stone-700", border: "border-stone-700", soft: "bg-stone-100", ring: "ring-stone-700" },
};

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Đang chờ", cls: "bg-stone-100 text-stone-600" },
    current: { label: "Đang xử lý", cls: "bg-amber-100 text-amber-700" },
    approved: { label: "Đã duyệt", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Từ chối", cls: "bg-red-100 text-red-700" },
    completed: { label: "Hoàn tất", cls: "bg-emerald-100 text-emerald-700" },
  };
  const m = map[status] || map.pending;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>;
}

export default function SentryERPDemo() {
  const [flows, setFlows] = useState(seedFlows);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState("dashboard"); // dashboard | flow | detail
  const [activeFlowId, setActiveFlowId] = useState(null);
  const [subTab, setSubTab] = useState("builder"); // builder | try
  const [activeRequestId, setActiveRequestId] = useState(null);

  const activeFlow = flows.find(f => f.id === activeFlowId);
  const activeRequest = requests.find(r => r.id === activeRequestId);

  function openFlow(id) {
    setActiveFlowId(id);
    setSubTab(flows.find(f => f.id === id)?.steps.length ? "builder" : "builder");
    setView("flow");
  }

  function updateFlowSteps(flowId, updater) {
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, steps: updater(f.steps) } : f));
  }

  function addStep(flowId) {
    updateFlowSteps(flowId, steps => [...steps, { id: uid(), name: "Bước duyệt mới", role: "Vai trò", approver: "Người duyệt", enabled: true }]);
  }
  function removeStep(flowId, stepId) {
    updateFlowSteps(flowId, steps => steps.filter(s => s.id !== stepId));
  }
  function moveStep(flowId, stepId, dir) {
    updateFlowSteps(flowId, steps => {
      const idx = steps.findIndex(s => s.id === stepId);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= steps.length) return steps;
      const copy = [...steps];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }
  function editStep(flowId, stepId, field, value) {
    updateFlowSteps(flowId, steps => steps.map(s => s.id === stepId ? { ...s, [field]: value } : s));
  }
  function renameFlow(flowId, name) {
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, name } : f));
  }

  function submitRequest(flow, form) {
    const enabledSteps = flow.steps.filter(s => s.enabled);
    const stepSnapshot = enabledSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? "current" : "pending",
      comment: "",
    }));
    const newReq = {
      id: uid(),
      code: `${flow.id.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      flowId: flow.id,
      flowName: flow.name,
      flowIcon: flow.icon,
      accent: flow.accent,
      title: form.title,
      building: form.building,
      amount: form.amount,
      dates: form.dates,
      description: form.description,
      requester: "Nguyễn Đỗ Huy Hoàng",
      createdAt: new Date(),
      steps: stepSnapshot,
      currentIndex: stepSnapshot.length ? 0 : -1,
      status: stepSnapshot.length ? "in_progress" : "completed",
      log: [{ text: "Yêu cầu được tạo và gửi đi", time: new Date() }],
    };
    setRequests(prev => [newReq, ...prev]);
    setActiveRequestId(newReq.id);
    setView("detail");
  }

  function actOnRequest(reqId, action, comment) {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      const steps = [...r.steps];
      const idx = r.currentIndex;
      if (idx < 0) return r;
      steps[idx] = { ...steps[idx], status: action === "approve" ? "approved" : "rejected", comment };
      let status = r.status;
      let nextIndex = idx;
      let logEntry;
      if (action === "reject") {
        status = "rejected";
        logEntry = `${steps[idx].approver} (${steps[idx].role}) đã từ chối${comment ? `: "${comment}"` : ""}`;
      } else {
        if (idx + 1 < steps.length) {
          steps[idx + 1] = { ...steps[idx + 1], status: "current" };
          nextIndex = idx + 1;
          status = "in_progress";
        } else {
          status = "completed";
          nextIndex = -1;
        }
        logEntry = `${steps[idx].approver} (${steps[idx].role}) đã duyệt${comment ? `: "${comment}"` : ""}`;
      }
      return { ...r, steps, currentIndex: nextIndex, status, log: [...r.log, { text: logEntry, time: new Date() }] };
    }));
  }

  function resetDemo() {
    setFlows(seedFlows());
    setRequests([]);
    setView("dashboard");
  }

  const stats = {
    total: requests.length,
    progress: requests.filter(r => r.status === "in_progress").length,
    done: requests.filter(r => r.status === "completed").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-stone-50 flex text-stone-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-stone-200 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center font-bold text-slate-900">S</div>
            <div>
              <div className="text-sm font-semibold text-white leading-none">The Sentry</div>
              <div className="text-[11px] text-slate-400 mt-0.5">ERP Workflow Demo</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${view === "dashboard" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60"}`}
          >
            <LayoutDashboard size={16} /> Bảng điều khiển
          </button>

          <div className="pt-4 pb-1 px-3 text-[11px] uppercase tracking-wider text-slate-500">Quy trình</div>
          {flows.map(f => {
            const Icon = ICONS[f.icon];
            const active = view === "flow" && activeFlowId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => openFlow(f.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60"}`}
              >
                <Icon size={16} /> <span className="truncate">{f.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700/60">
          <button onClick={resetDemo} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800/60 transition">
            <RotateCcw size={13} /> Đặt lại toàn bộ demo
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {view === "dashboard" && (
          <DashboardView
            flows={flows}
            requests={requests}
            stats={stats}
            onOpenFlow={openFlow}
            onOpenRequest={(id) => { setActiveRequestId(id); setView("detail"); }}
          />
        )}

        {view === "flow" && activeFlow && (
          <FlowView
            flow={activeFlow}
            subTab={subTab}
            setSubTab={setSubTab}
            onBack={() => setView("dashboard")}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onMoveStep={moveStep}
            onEditStep={editStep}
            onRenameFlow={renameFlow}
            onSubmitRequest={submitRequest}
          />
        )}

        {view === "detail" && activeRequest && (
          <DetailView
            request={activeRequest}
            onBack={() => setView("dashboard")}
            onAct={actOnRequest}
          />
        )}
      </main>
    </div>
  );
}

function DashboardView({ flows, requests, stats, onOpenFlow, onOpenRequest }) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-1">Demo phương án đầu tư ERP</div>
        <h1 className="text-2xl font-bold text-slate-900">Trải nghiệm quy trình phê duyệt</h1>
        <p className="text-stone-500 mt-1 text-sm max-w-2xl">
          Chọn một quy trình bên trái để tùy chỉnh các bước duyệt, hoặc gửi thử một yêu cầu để xem luồng phê duyệt vận hành thực tế qua các tòa nhà của The Sentry.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Tổng yêu cầu" value={stats.total} />
        <StatCard label="Đang xử lý" value={stats.progress} accent="amber" />
        <StatCard label="Hoàn tất" value={stats.done} accent="emerald" />
        <StatCard label="Bị từ chối" value={stats.rejected} accent="rose" />
      </div>

      <div className="mb-3 text-sm font-semibold text-slate-700">Các quy trình mẫu</div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {flows.map(f => {
          const Icon = ICONS[f.icon];
          const a = accentMap[f.accent];
          return (
            <button key={f.id} onClick={() => onOpenFlow(f.id)} className="text-left bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-sm transition group">
              <div className={`w-9 h-9 rounded-lg ${a.soft} ${a.text} flex items-center justify-center mb-3`}>
                <Icon size={17} />
              </div>
              <div className="font-semibold text-sm text-slate-900">{f.name}</div>
              <div className="text-xs text-stone-500 mt-1 leading-relaxed">{f.desc}</div>
              <div className="text-xs text-stone-400 mt-3">{f.steps.length} bước duyệt</div>
            </button>
          );
        })}
      </div>

      <div className="mb-3 text-sm font-semibold text-slate-700">Yêu cầu đã gửi thử</div>
      {requests.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl p-10 text-center text-stone-400 text-sm">
          Chưa có yêu cầu nào. Mở một quy trình và bấm "Gửi thử yêu cầu" để bắt đầu mô phỏng.
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-4 py-3">Mã</th>
                <th className="text-left font-medium px-4 py-3">Tiêu đề</th>
                <th className="text-left font-medium px-4 py-3">Quy trình</th>
                <th className="text-left font-medium px-4 py-3">Tòa nhà</th>
                <th className="text-left font-medium px-4 py-3">Trạng thái</th>
                <th className="text-left font-medium px-4 py-3">Bước hiện tại</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} onClick={() => onOpenRequest(r.id)} className="border-t border-stone-100 hover:bg-stone-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{r.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.title || "(chưa đặt tiêu đề)"}</td>
                  <td className="px-4 py-3 text-stone-600">{r.flowName}</td>
                  <td className="px-4 py-3 text-stone-600">{r.building || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status === "in_progress" ? "current" : r.status} /></td>
                  <td className="px-4 py-3 text-stone-500">{r.currentIndex >= 0 ? r.steps[r.currentIndex]?.name : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const colorMap = { amber: "text-amber-600", emerald: "text-emerald-600", rose: "text-rose-600" };
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ? colorMap[accent] : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function FlowView({ flow, subTab, setSubTab, onBack, onAddStep, onRemoveStep, onMoveStep, onEditStep, onRenameFlow, onSubmitRequest }) {
  const Icon = ICONS[flow.icon];
  const a = accentMap[flow.accent];
  const [form, setForm] = useState({ title: "", building: BUILDINGS[0], amount: "", dates: "", description: "" });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5">
        <ChevronLeft size={16} /> Bảng điều khiển
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className={`w-11 h-11 rounded-xl ${a.soft} ${a.text} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          {flow.isCustom ? (
            <input
              value={flow.name}
              onChange={e => onRenameFlow(flow.id, e.target.value)}
              className="text-xl font-bold text-slate-900 bg-transparent border-b border-dashed border-stone-300 focus:outline-none focus:border-stone-500 w-full"
            />
          ) : (
            <h1 className="text-xl font-bold text-slate-900">{flow.name}</h1>
          )}
          <p className="text-stone-500 text-sm mt-1">{flow.desc}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-stone-200">
        <TabButton active={subTab === "builder"} onClick={() => setSubTab("builder")} label="Tùy chỉnh quy trình" />
        <TabButton active={subTab === "try"} onClick={() => setSubTab("try")} label="Trải nghiệm thử" />
      </div>

      {subTab === "builder" && (
        <div>
          <div className="space-y-3 mb-4">
            {flow.steps.length === 0 && (
              <div className="bg-white border border-dashed border-stone-300 rounded-xl p-8 text-center text-stone-400 text-sm">
                Chưa có bước duyệt nào. Bấm "Thêm bước" để bắt đầu dựng quy trình.
              </div>
            )}
            {flow.steps.map((s, i) => (
              <div key={s.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-7 h-7 rounded-full ${a.bg} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>{i + 1}</div>
                <div className="grid grid-cols-3 gap-3 flex-1">
                  <div>
                    <label className="text-[11px] text-stone-400">Tên bước</label>
                    <input value={s.name} onChange={e => onEditStep(flow.id, s.id, "name", e.target.value)}
                      className="w-full text-sm border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400">Vai trò duyệt</label>
                    <input value={s.role} onChange={e => onEditStep(flow.id, s.id, "role", e.target.value)}
                      className="w-full text-sm border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400">Người duyệt</label>
                    <input value={s.approver} onChange={e => onEditStep(flow.id, s.id, "approver", e.target.value)}
                      className="w-full text-sm border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-stone-500 mr-2">
                    <input type="checkbox" checked={s.enabled} onChange={e => onEditStep(flow.id, s.id, "enabled", e.target.checked)} />
                    Bật
                  </label>
                  <button disabled={i === 0} onClick={() => onMoveStep(flow.id, s.id, -1)} className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button disabled={i === flow.steps.length - 1} onClick={() => onMoveStep(flow.id, s.id, 1)} className="p-1.5 rounded hover:bg-stone-100 disabled:opacity-30"><ArrowDown size={14} /></button>
                  <button onClick={() => onRemoveStep(flow.id, s.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onAddStep(flow.id)} className="flex items-center gap-1.5 text-sm font-medium text-stone-600 border border-stone-300 border-dashed rounded-lg px-3 py-2 hover:bg-stone-100">
            <Plus size={15} /> Thêm bước duyệt
          </button>
        </div>
      )}

      {subTab === "try" && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 max-w-xl">
          <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-slate-800">
            <FileText size={15} /> Tạo yêu cầu mô phỏng
          </div>
          <div className="space-y-4">
            <Field label="Tiêu đề yêu cầu">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Mua 5 laptop cho team vận hành Sonatus"
                className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </Field>
            {flow.fields.building && (
              <Field label="Tòa nhà liên quan">
                <select value={form.building} onChange={e => setForm({ ...form, building: e.target.value })}
                  className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300">
                  {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            )}
            {flow.fields.amount && (
              <Field label="Số tiền (VNĐ)">
                <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="VD: 25.000.000"
                  className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </Field>
            )}
            {flow.fields.dates && (
              <Field label="Thời gian nghỉ">
                <input value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })}
                  placeholder="VD: 20/08 - 22/08/2026"
                  className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </Field>
            )}
            <Field label="Mô tả / lý do">
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3} placeholder="Chi tiết yêu cầu..."
                className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </Field>
          </div>
          <button
            disabled={flow.steps.filter(s => s.enabled).length === 0}
            onClick={() => onSubmitRequest(flow, form)}
            className={`mt-5 w-full flex items-center justify-center gap-2 ${a.bg} text-white text-sm font-medium rounded-lg py-2.5 disabled:opacity-40`}
          >
            <PlayCircle size={16} /> Gửi thử yêu cầu & bắt đầu mô phỏng
          </button>
          {flow.steps.filter(s => s.enabled).length === 0 && (
            <div className="text-xs text-rose-500 mt-2">Quy trình chưa có bước duyệt nào đang bật — vào tab "Tùy chỉnh quy trình" để thêm.</div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${active ? "border-slate-900 text-slate-900" : "border-transparent text-stone-400 hover:text-stone-600"}`}>
      {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-stone-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function DetailView({ request, onBack, onAct }) {
  const [comment, setComment] = useState("");
  const a = accentMap[request.accent];
  const Icon = ICONS[request.flowIcon];
  const currentStep = request.currentIndex >= 0 ? request.steps[request.currentIndex] : null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5">
        <ChevronLeft size={16} /> Bảng điều khiển
      </button>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${a.soft} ${a.text} flex items-center justify-center`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="font-mono text-xs text-stone-400">{request.code}</div>
              <div className="font-bold text-slate-900">{request.title || "(chưa đặt tiêu đề)"}</div>
            </div>
          </div>
          <StatusBadge status={request.status === "in_progress" ? "current" : request.status} />
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm border-t border-stone-100 pt-4">
          <div><div className="text-xs text-stone-400">Quy trình</div><div className="text-stone-700">{request.flowName}</div></div>
          <div><div className="text-xs text-stone-400">Người gửi</div><div className="text-stone-700">{request.requester}</div></div>
          {request.building && <div><div className="text-xs text-stone-400">Tòa nhà</div><div className="text-stone-700 flex items-center gap-1"><Building2 size={13} />{request.building}</div></div>}
          {request.amount && <div><div className="text-xs text-stone-400">Số tiền</div><div className="text-stone-700">{request.amount} đ</div></div>}
          {request.dates && <div><div className="text-xs text-stone-400">Thời gian</div><div className="text-stone-700">{request.dates}</div></div>}
        </div>
        {request.description && <div className="mt-4 text-sm text-stone-600 bg-stone-50 rounded-lg p-3">{request.description}</div>}
      </div>

      <div className="mb-2 text-sm font-semibold text-slate-700">Chuỗi phê duyệt</div>
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="flex items-stretch">
          {request.steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mx-auto
                  ${s.status === "approved" ? "bg-emerald-500 text-white" :
                    s.status === "rejected" ? "bg-red-500 text-white" :
                    s.status === "current" ? `${a.bg} text-white` : "bg-stone-100 text-stone-400"}`}>
                  {s.status === "approved" ? <CheckCircle2 size={16} /> : s.status === "rejected" ? <XCircle size={16} /> : i + 1}
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-medium text-stone-800">{s.name}</div>
                  <div className="text-[11px] text-stone-400">{s.approver}</div>
                  <div className="text-[11px] text-stone-400">{s.role}</div>
                </div>
              </div>
              {i < request.steps.length - 1 && <div className="w-8 h-px bg-stone-200 mt-4 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {currentStep && (
        <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6">
          <div className="text-sm font-semibold text-slate-800 mb-1">Mô phỏng: {currentStep.approver} ({currentStep.role})</div>
          <div className="text-xs text-stone-400 mb-3">Bấm nút bên dưới để mô phỏng hành động của người duyệt ở bước này.</div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ghi chú / lý do (tuỳ chọn)"
            rows={2} className="w-full text-sm border border-stone-200 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-300" />
          <div className="flex gap-2">
            <button onClick={() => { onAct(request.id, "approve", comment); setComment(""); }}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-emerald-700">
              <CheckCircle2 size={15} /> Duyệt
            </button>
            <button onClick={() => { onAct(request.id, "reject", comment); setComment(""); }}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-100">
              <XCircle size={15} /> Từ chối
            </button>
          </div>
        </div>
      )}

      {request.status === "completed" && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm rounded-xl p-4 mb-6">
          <Sparkles size={16} /> Yêu cầu đã hoàn tất toàn bộ chuỗi phê duyệt.
        </div>
      )}
      {request.status === "rejected" && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl p-4 mb-6">
          <XCircle size={16} /> Yêu cầu đã bị từ chối và dừng quy trình.
        </div>
      )}

      <div className="mb-2 text-sm font-semibold text-slate-700 flex items-center gap-1.5"><MessageSquare size={14} /> Lịch sử hoạt động</div>
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {request.log.map((l, i) => (
          <div key={i} className="px-4 py-3 text-sm text-stone-600 flex items-center justify-between">
            <span>{l.text}</span>
            <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0 ml-4"><Clock size={11} />{l.time.toLocaleTimeString("vi-VN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
