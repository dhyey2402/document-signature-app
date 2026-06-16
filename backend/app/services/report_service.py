"""
Dashboard PDF report generator.

Builds a multi-page, professionally styled PDF using ReportLab.
Charts are rendered with matplotlib into in-memory PNG buffers and
embedded as images — no temp files written to disk.
"""

from __future__ import annotations

import io
import math
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.figure import Figure

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

# ── Brand palette ────────────────────────────────────────────────────────────
BRAND_BLUE    = colors.HexColor("#2563EB")   # primary-600
BRAND_INDIGO  = colors.HexColor("#4F46E5")   # accent
BRAND_SLATE   = colors.HexColor("#1E293B")   # slate-800
BRAND_MUTED   = colors.HexColor("#64748B")   # slate-500
BRAND_LIGHT   = colors.HexColor("#F1F5F9")   # slate-100
BRAND_SUCCESS = colors.HexColor("#10B981")   # emerald-500
BRAND_WARNING = colors.HexColor("#F59E0B")   # amber-500
BRAND_DANGER  = colors.HexColor("#EF4444")   # red-500
WHITE         = colors.white
PAGE_W, PAGE_H = A4                          # 595.27 × 841.89 pt

MPL_COLORS = {
    "pending":  "#F59E0B",
    "signed":   "#10B981",
    "rejected": "#EF4444",
}
MPL_BAR = "#2563EB"
MPL_LINE = "#4F46E5"
MPL_BG   = "#F8FAFC"


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _fig_to_image(fig: Figure, width_pt: float, height_pt: float) -> Image:
    """Convert a matplotlib Figure to a ReportLab Image (in-memory PNG)."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=200, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    buf.seek(0)
    plt.close(fig)
    return Image(buf, width=width_pt, height=height_pt)


def _style(name: str, **kw) -> ParagraphStyle:
    base = getSampleStyleSheet()["Normal"]
    return ParagraphStyle(name, parent=base, **kw)


def _calc_age(doc) -> str:
    now = datetime.now(timezone.utc)
    start = doc.created_at
    if not start:
        return "—"
    
    status = str(doc.status or "pending").lower()
    
    if status == "signed" and doc.signed_at:
        diff = doc.signed_at - start
    elif status == "rejected" and doc.rejected_at:
        diff = doc.rejected_at - start
    else:
        diff = now - start

    days = diff.days
    hours = diff.seconds // 3600
    
    if status == "signed":
        if days > 0:
            return f"Completed in {days}.{int(hours/2.4)} days"
        return f"Completed in {hours} hours"
    elif status == "rejected":
        if days > 0:
            return f"Rejected after {days} days"
        return f"Rejected in {hours} hours"
    else:
        if days > 0:
            return f"Pending for {days} days"
        return f"Pending for {hours} hours"


def _format_time_diff(diff: timedelta) -> str:
    days = diff.days
    hours = diff.seconds // 3600
    if days > 0:
        return f"{days}.{int(hours/2.4)} days"
    return f"{hours} hours"


# ─────────────────────────────────────────────────────────────────────────────
# Chart generators
# ─────────────────────────────────────────────────────────────────────────────

def _pie_chart(pending: int, signed: int, rejected: int,
               width_pt: float = 160, height_pt: float = 160) -> Image:
    data = [(v, k) for k, v in [("Pending", pending), ("Signed", signed), ("Rejected", rejected)] if v > 0]
    if not data:
        data = [(1, "No data")]

    values = [d[0] for d in data]
    labels = [d[1] for d in data]
    palette = [MPL_COLORS.get(l.lower(), "#94A3B8") for l in labels]

    fig, ax = plt.subplots(figsize=(width_pt / 72, height_pt / 72))
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FFFFFF")

    wedges, texts, autotexts = ax.pie(
        values,
        labels=None, # Hide labels on the chart itself, we use a legend/table
        colors=palette,
        autopct="%1.0f%%",
        startangle=140,
        pctdistance=0.75,
        wedgeprops=dict(width=0.4, edgecolor="white", linewidth=2),
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_color("#1E293B")
        at.set_fontweight("bold")

    fig.tight_layout(pad=0)
    return _fig_to_image(fig, width_pt, height_pt)


def _line_chart(docs: list, width_pt: float = 340, height_pt: float = 160) -> Image:
    monthly_created: dict[str, int] = defaultdict(int)
    monthly_signed: dict[str, int] = defaultdict(int)
    
    for d in docs:
        if d.created_at:
            key = d.created_at.strftime("%Y-%m")
            monthly_created[key] += 1
        if str(d.status).lower() == "signed" and d.signed_at:
            key = d.signed_at.strftime("%Y-%m")
            monthly_signed[key] += 1

    all_keys = set(monthly_created.keys()) | set(monthly_signed.keys())
    if not all_keys:
        all_keys = {datetime.now().strftime("%Y-%m")}

    sorted_keys = sorted(list(all_keys))
    # format for display: "Jan 26"
    display_keys = [datetime.strptime(k, "%Y-%m").strftime("%b %y") for k in sorted_keys]

    y_created = [monthly_created[k] for k in sorted_keys]
    y_signed = [monthly_signed[k] for k in sorted_keys]

    x = list(range(len(sorted_keys)))

    fig, ax = plt.subplots(figsize=(width_pt / 72, height_pt / 72))
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FFFFFF")

    ax.plot(x, y_created, color=MPL_LINE, linewidth=2, marker="o", label="Created", markersize=4)
    ax.plot(x, y_signed, color=MPL_COLORS["signed"], linewidth=2, marker="o", label="Signed", markersize=4)

    ax.set_xticks(x)
    ax.set_xticklabels(display_keys, rotation=0, ha="center", fontsize=8, color="#64748B")
    
    max_val = max(max(y_created, default=0), max(y_signed, default=0))
    ax.set_yticks(range(0, max_val + 2, max(1, math.ceil(max_val / 5))))
    ax.yaxis.set_tick_params(labelsize=8, colors="#64748B")
    
    ax.grid(axis="y", linestyle="--", alpha=0.3, color="#64748B")
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.spines["bottom"].set_color("#F1F5F9")
    
    ax.legend(loc="upper left", frameon=False, fontsize=8, labelcolor="#1E293B")
    
    fig.tight_layout(pad=0.2)
    return _fig_to_image(fig, width_pt, height_pt)


def _funnel_chart(stages: list[tuple[str, int]], width_pt: float = 400, height_pt: float = 160) -> Image:
    """Horizontal funnel chart."""
    fig, ax = plt.subplots(figsize=(width_pt / 72, height_pt / 72))
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FFFFFF")

    labels = [s[0] for s in stages]
    values = [s[1] for s in stages]
    
    # Reverse so top of funnel is at top of y-axis
    labels.reverse()
    values.reverse()

    y_pos = range(len(labels))
    max_val = max(values) if values else 1
    
    # Colors gradient
    colors_list = ["#2563EB", "#4F46E5", "#6366F1", "#10B981"]
    if len(colors_list) < len(labels):
        colors_list = ["#2563EB"] * len(labels)
    colors_list.reverse()

    bars = ax.barh(y_pos, values, color=colors_list, height=0.6)
    
    # Value labels
    for bar, val in zip(bars, values):
        if val > 0:
            ax.text(val + (max_val * 0.02), bar.get_y() + bar.get_height()/2, 
                    str(val), va='center', ha='left', fontsize=9, fontweight='bold', color="#1E293B")
            if val < max_val:
                pct = int(val / max_val * 100)
                ax.text(val + (max_val * 0.08), bar.get_y() + bar.get_height()/2, 
                        f"({pct}%)", va='center', ha='left', fontsize=8, color="#64748B")

    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=9, color="#1E293B")
    ax.set_xticks([]) # Hide x axis
    
    ax.spines[["top", "right", "bottom", "left"]].set_visible(False)
    
    fig.tight_layout(pad=0)
    return _fig_to_image(fig, width_pt, height_pt)


# ─────────────────────────────────────────────────────────────────────────────
# Page templates
# ─────────────────────────────────────────────────────────────────────────────

class _PageDecorator:
    def __init__(self, user_name: str, generated_at: str):
        self.user_name = user_name
        self.generated_at = generated_at

    def _draw_page(self, canvas, doc, is_cover=False):
        canvas.saveState()
        w, h = PAGE_W, PAGE_H

        if not is_cover:
            # Top rule
            canvas.setFillColor(BRAND_BLUE)
            canvas.rect(0, h - 6, w, 6, fill=1, stroke=0)

            # Header text
            canvas.setFillColor(BRAND_MUTED)
            canvas.setFont("Helvetica-Bold", 8)
            canvas.drawString(20 * mm, h - 14 * mm, "Signly Analytics Report")
            
            canvas.setFont("Helvetica", 8)
            canvas.drawRightString(w - 20 * mm, h - 14 * mm, f"Prepared for: {self.user_name}")

            # Footer text
            canvas.setFillColor(BRAND_MUTED)
            canvas.setFont("Helvetica", 8)
            canvas.drawString(20 * mm, 12 * mm, f"Generated: {self.generated_at}")
            canvas.drawRightString(w - 20 * mm, 12 * mm, f"Page {doc.page}")

        canvas.restoreState()


# ─────────────────────────────────────────────────────────────────────────────
# Main builder
# ─────────────────────────────────────────────────────────────────────────────

def build_dashboard_pdf(
    user_name: str,
    docs: list,
    audit_logs: list,
    signing_links: list,
) -> bytes:
    buf = io.BytesIO()
    generated_at = datetime.now(timezone.utc).strftime("%d %b %Y")
    deco = _PageDecorator(user_name, generated_at)

    # ── Calculations ──────────────────────────────────────────────────────────
    total_docs = len(docs)
    pending    = sum(1 for d in docs if str(d.status or "").lower() in ("pending", "draft"))
    signed     = sum(1 for d in docs if str(d.status or "").lower() == "signed")
    rejected   = sum(1 for d in docs if str(d.status or "").lower() == "rejected")
    
    success_rate = round((signed / (signed + rejected) * 100), 1) if (signed + rejected) > 0 else 0.0
    
    # Average signing time
    signing_times = []
    for d in docs:
        if str(d.status).lower() == "signed" and d.signed_at and d.created_at:
            signing_times.append(d.signed_at - d.created_at)
    
    avg_signing_time_str = "—"
    if signing_times:
        avg_time = sum(signing_times, timedelta()) / len(signing_times)
        avg_signing_time_str = _format_time_diff(avg_time)
        
    # Recipient metrics
    total_links = len(signing_links)
    unique_recipients = len(set(lnk.recipient_email for lnk in signing_links))
    signed_links = sum(1 for lnk in signing_links if str(lnk.status).lower() == "signed")
    pending_links = sum(1 for lnk in signing_links if str(lnk.status).lower() == "pending")

    # Funnel
    viewed_events = sum(1 for e in audit_logs if e.action == "DOCUMENT_VIEWED")
    
    # ── Page Setup ────────────────────────────────────────────────────────────
    MARGIN = 20 * mm
    CONTENT_W = PAGE_W - 2 * MARGIN

    def _on_cover(canvas, doc):
        deco._draw_page(canvas, doc, is_cover=True)
        canvas.saveState()
        canvas.setFillColor(BRAND_BLUE)
        canvas.rect(0, PAGE_H - 120 * mm, PAGE_W, 120 * mm, fill=1, stroke=0)
        canvas.setFillColor(BRAND_INDIGO)
        canvas.rect(0, PAGE_H - 120 * mm, 8, 120 * mm, fill=1, stroke=0)
        canvas.restoreState()

    def _on_page(canvas, doc):
        deco._draw_page(canvas, doc, is_cover=False)

    cover_frame = Frame(MARGIN, MARGIN, CONTENT_W, PAGE_H - 2 * MARGIN, id="cover")
    body_frame  = Frame(MARGIN, 20 * mm, CONTENT_W, PAGE_H - 20 * mm - 20 * mm, id="body")

    doc = BaseDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=MARGIN, leftMargin=MARGIN,
        topMargin=20 * mm, bottomMargin=20 * mm,
        title="Signly Analytics Report",
        author=user_name,
    )
    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=_on_cover),
        PageTemplate(id="Body",  frames=[body_frame],  onPage=_on_page),
    ])

    # ── Styles ────────────────────────────────────────────────────────────────
    COVER_TITLE   = _style("CoverTitle",   fontSize=34, textColor=WHITE,       fontName="Helvetica-Bold", alignment=TA_LEFT, leading=40)
    COVER_SUB     = _style("CoverSub",     fontSize=14, textColor=colors.HexColor("#BFDBFE"), fontName="Helvetica", alignment=TA_LEFT, leading=20)
    COVER_META_H  = _style("CoverMetaH",   fontSize=9,  textColor=colors.HexColor("#93C5FD"), fontName="Helvetica-Bold", alignment=TA_LEFT, leading=14)
    COVER_META_V  = _style("CoverMetaV",   fontSize=11, textColor=WHITE,       fontName="Helvetica", alignment=TA_LEFT, leading=16)
    
    SECTION_TITLE = _style("SectionTitle", fontSize=16, textColor=BRAND_SLATE, fontName="Helvetica-Bold", alignment=TA_LEFT, leading=20, spaceAfter=8)
    SUB_TITLE     = _style("SubTitle",     fontSize=12, textColor=BRAND_SLATE, fontName="Helvetica-Bold", alignment=TA_LEFT, leading=16, spaceAfter=6)
    BODY          = _style("Body",         fontSize=10, textColor=BRAND_SLATE, fontName="Helvetica",      alignment=TA_LEFT, leading=14)
    BODY_MUTED    = _style("BodyMuted",    fontSize=9,  textColor=BRAND_MUTED, fontName="Helvetica",      alignment=TA_LEFT, leading=13)
    
    TH            = _style("TH",           fontSize=9,  textColor=BRAND_SLATE, fontName="Helvetica-Bold", alignment=TA_LEFT,  leading=12)
    TD            = _style("TD",           fontSize=9,  textColor=BRAND_SLATE, fontName="Helvetica",      alignment=TA_LEFT,  leading=12)

    story: list = []

    # ─────────────────────────────────────────────────────────────────────────
    # PAGE 1: EXECUTIVE SUMMARY
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 40 * mm))
    story.append(Paragraph("Signly Analytics", COVER_TITLE))
    story.append(Paragraph("Report", COVER_TITLE))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Signature Management Platform", COVER_SUB))
    story.append(Spacer(1, 16 * mm))
    
    meta_table = Table([
        [Paragraph("PREPARED FOR", COVER_META_H), Paragraph("GENERATED", COVER_META_H), Paragraph("REPORTING PERIOD", COVER_META_H)],
        [Paragraph(user_name, COVER_META_V), Paragraph(generated_at, COVER_META_V), Paragraph("All Time", COVER_META_V)],
    ], colWidths=[60*mm, 50*mm, 50*mm])
    meta_table.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0)]))
    story.append(meta_table)

    story.append(Spacer(1, 35 * mm))

    # KPI Cards
    def _kpi_card(label, value, is_primary=False):
        val_color = BRAND_BLUE if is_primary else BRAND_SLATE
        val_style = _style(f"kpi_v", fontSize=26, textColor=val_color, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=32)
        lbl_style = _style(f"kpi_l", fontSize=9, textColor=BRAND_MUTED, fontName="Helvetica", alignment=TA_CENTER, leading=12)
        return [Paragraph(str(value), val_style), Spacer(1, 2*mm), Paragraph(label, lbl_style)]

    kpi_data = [
        [
            _kpi_card("Total Documents", total_docs, True),
            _kpi_card("Completion Rate", f"{success_rate}%", True),
            _kpi_card("Avg Signing Time", avg_signing_time_str, True),
        ],
        [
            _kpi_card("Signed", signed),
            _kpi_card("Pending", pending),
            _kpi_card("Rejected", rejected),
        ]
    ]
    
    kpi_table = Table(kpi_data, colWidths=[CONTENT_W / 3] * 3)
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(kpi_table)

    # Highlights
    story.append(Spacer(1, 12 * mm))
    story.append(Paragraph("Highlights", SUB_TITLE))
    
    highlights = [
        f"• <font color='{BRAND_BLUE.hexval()}'><b>{success_rate}%</b></font> of processed documents were completed successfully." if success_rate > 0 else "• No documents have been fully processed yet.",
        f"• Average signing time across all completed documents is <font color='{BRAND_BLUE.hexval()}'><b>{avg_signing_time_str}</b></font>.",
        f"• <font color='{BRAND_BLUE.hexval()}'><b>{unique_recipients}</b></font> unique recipients have interacted with your documents.",
        f"• <font color='{BRAND_DANGER.hexval()}'><b>{rejected}</b></font> documents were rejected by signers." if rejected > 0 else "• 0 documents were rejected by signers."
    ]
    
    for h in highlights:
        story.append(Paragraph(h, _style("Highlight", fontSize=11, textColor=BRAND_SLATE, fontName="Helvetica", leading=18)))

    story.append(NextPageTemplate("Body"))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # PAGE 2: VISUAL ANALYTICS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Visual Analytics", SECTION_TITLE))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_LIGHT, spaceAfter=15))

    story.append(Paragraph("Document Status Distribution", SUB_TITLE))
    
    # Status card with pie and compact table
    pie_img = _pie_chart(pending, signed, rejected, width_pt=180, height_pt=180)
    
    def _status_row(label, count, color_hex):
        pct = int(round(count / total_docs * 100)) if total_docs else 0
        return [
            Paragraph(f"<font color='{color_hex}'>■</font> {label}", BODY),
            Paragraph(f"<b>{count}</b>", _style("R", alignment=TA_RIGHT, fontName="Helvetica-Bold", fontSize=10)),
            Paragraph(f"{pct}%", _style("R2", alignment=TA_RIGHT, fontName="Helvetica", fontSize=10, textColor=BRAND_MUTED)),
        ]
        
    status_data = [
        _status_row("Signed", signed, MPL_COLORS["signed"]),
        _status_row("Pending", pending, MPL_COLORS["pending"]),
        _status_row("Rejected", rejected, MPL_COLORS["rejected"]),
    ]
    
    status_table = Table(status_data, colWidths=[60*mm, 20*mm, 20*mm])
    status_table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("LINEBELOW", (0,0), (-1,-2), 0.5, BRAND_LIGHT),
    ]))

    layout_table = Table([[pie_img, status_table]], colWidths=[200, CONTENT_W - 200])
    layout_table.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
    
    story.append(layout_table)
    story.append(Spacer(1, 15 * mm))

    story.append(Paragraph("Activity Trend", SUB_TITLE))
    line_img = _line_chart(docs, width_pt=CONTENT_W, height_pt=200)
    story.append(line_img)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # PAGE 3: RECIPIENT & SIGNING ANALYTICS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Recipient & Funnel Analytics", SECTION_TITLE))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_LIGHT, spaceAfter=15))

    # Recipient KPIs
    story.append(Paragraph("Recipient Overview", SUB_TITLE))
    recip_kpi_table = Table([
        [
            _kpi_card("Total Links Sent", total_links),
            _kpi_card("Signed Recipients", signed_links),
            _kpi_card("Pending Recipients", pending_links),
        ]
    ], colWidths=[CONTENT_W / 3] * 3)
    recip_kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(recip_kpi_table)
    story.append(Spacer(1, 15 * mm))

    # Funnel
    story.append(Paragraph("Signing Funnel", SUB_TITLE))
    story.append(Paragraph("Tracks the progression of documents from upload to successful signature.", BODY_MUTED))
    story.append(Spacer(1, 4 * mm))
    
    funnel_stages = [
        ("Documents Uploaded", total_docs),
        ("Links Generated", total_links),
        ("Documents Viewed", viewed_events),
        ("Signatures Placed", signed),
    ]
    funnel_img = _funnel_chart(funnel_stages, width_pt=CONTENT_W, height_pt=200)
    story.append(funnel_img)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # PAGE 4: DOCUMENT PERFORMANCE
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Document Performance", SECTION_TITLE))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_LIGHT, spaceAfter=15))
    story.append(Paragraph("Detailed breakdown of your most recent 25 documents.", BODY_MUTED))
    story.append(Spacer(1, 6 * mm))

    recent_docs = sorted(docs, key=lambda d: d.created_at or datetime.min, reverse=True)[:25]

    def _status_color(s: str):
        s = str(s or "").lower()
        if s == "signed":   return colors.HexColor("#D1FAE5"), colors.HexColor("#065F46")
        if s == "rejected": return colors.HexColor("#FEE2E2"), colors.HexColor("#991B1B")
        return colors.HexColor("#FEF3C7"), colors.HexColor("#92400E")

    doc_rows = [[
        Paragraph("Title", TH),
        Paragraph("Status", TH),
        Paragraph("Recipient", TH),
        Paragraph("Age / Time", TH),
    ]]
    
    # Pre-compute links per doc
    doc_links_map = defaultdict(list)
    for lnk in signing_links:
        doc_links_map[lnk.document_id].append(lnk)

    for d in recent_docs:
        bg, fg = _status_color(d.status)
        status_label = str(d.status or "pending").capitalize()
        
        links = doc_links_map.get(d.id, [])
        if len(links) == 1:
            recip_str = links[0].recipient_name
        elif len(links) > 1:
            recip_str = f"Multiple ({len(links)})"
        else:
            recip_str = "None"
            
        age_str = _calc_age(d)

        doc_rows.append([
            Paragraph(str(d.title or "")[:40], TD),
            Paragraph(status_label, _style(f"s_{d.id}", fontSize=8, textColor=fg, fontName="Helvetica-Bold")),
            Paragraph(recip_str, TD),
            Paragraph(age_str, _style(f"a_{d.id}", fontSize=8, textColor=BRAND_MUTED, fontName="Helvetica")),
        ])

    col_widths = [CONTENT_W * 0.45, CONTENT_W * 0.15, CONTENT_W * 0.20, CONTENT_W * 0.20]
    doc_table = Table(doc_rows, colWidths=col_widths, repeatRows=1)
    
    ts = [
        ("LINEBELOW", (0, 0), (-1, 0), 1, BRAND_SLATE),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, BRAND_LIGHT),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]
    # Status column background
    for i, d in enumerate(recent_docs, 1):
        bg, _ = _status_color(d.status)
        ts.append(("BACKGROUND", (1, i), (1, i), bg))
        
    doc_table.setStyle(TableStyle(ts))
    story.append(doc_table)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # PAGE 5: AUDIT INSIGHTS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Audit Insights", SECTION_TITLE))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_LIGHT, spaceAfter=15))

    # Last 30 Days Summary
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_audit = [e for e in audit_logs if e.created_at and e.created_at >= thirty_days_ago]
    
    c_upl = sum(1 for e in recent_audit if e.action == "DOCUMENT_UPLOADED")
    c_lnk = sum(1 for e in recent_audit if e.action == "SIGNING_LINK_CREATED")
    c_sig = sum(1 for e in recent_audit if e.action in ("SIGNATURE_PLACED", "DOCUMENT_SIGNED"))
    c_rej = sum(1 for e in recent_audit if e.action == "DOCUMENT_REJECTED")

    story.append(Paragraph("Last 30 Days", SUB_TITLE))
    
    summary_data = [
        [
            Paragraph(f"<b>{c_upl}</b> Documents Uploaded", BODY),
            Paragraph(f"<b>{c_lnk}</b> Signing Links Sent", BODY)
        ],
        [
            Paragraph(f"<b>{c_sig}</b> Documents Signed", BODY),
            Paragraph(f"<b>{c_rej}</b> Documents Rejected", BODY)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[CONTENT_W/2, CONTENT_W/2])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_LIGHT),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("ROUNDEDCORNERS", [6]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20 * mm))

    # Latest Important Events
    story.append(Paragraph("Latest Important Events", SUB_TITLE))
    
    IMPORTANT_ACTIONS = {
        "DOCUMENT_SIGNED": "Signed Document",
        "DOCUMENT_REJECTED": "Rejected Document",
        "SIGNING_LINK_CREATED": "Sent Link",
    }
    
    important_events = [e for e in audit_logs if e.action in IMPORTANT_ACTIONS][:8]
    
    if important_events:
        ev_rows = []
        for ev in important_events:
            action_label = IMPORTANT_ACTIONS[ev.action]
            date_str = ev.created_at.strftime("%d %b %Y, %H:%M") if ev.created_at else "—"
            doc_title = str(ev.document.title)[:50] if ev.document else "Unknown Document"
            
            ev_rows.append([
                Paragraph(f"<b>{action_label}</b>", TD),
                Paragraph(doc_title, TD),
                Paragraph(date_str, _style(f"ev_d_{ev.id}", fontSize=8, textColor=BRAND_MUTED, alignment=TA_RIGHT)),
            ])
            
        ev_table = Table(ev_rows, colWidths=[CONTENT_W * 0.25, CONTENT_W * 0.50, CONTENT_W * 0.25])
        ev_table.setStyle(TableStyle([
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, BRAND_LIGHT),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ]))
        story.append(ev_table)
    else:
        story.append(Paragraph("No major events recorded yet.", BODY_MUTED))

    # ─────────────────────────────────────────────────────────────────────────
    # BUILD
    # ─────────────────────────────────────────────────────────────────────────
    doc.build(story)
    return buf.getvalue()
