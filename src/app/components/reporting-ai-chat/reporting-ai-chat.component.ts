import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ChartDto {
    type: 'bar' | 'pie' | 'line' | string;
    title: string;
    labels: string[];
    values: number[];
}

interface ReportDto {
    fileName: string;
    fileContent: string | number[]; // base64 string or array
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    time: string;
    charts?: ChartDto[];
    report?: ReportDto | null;
}

@Component({
    selector: 'app-reporting-ai-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reporting-ai-chat.component.html',
    styleUrls: ['./reporting-ai-chat.component.css']
})
export class ReportingAIChatComponent {
    messages: ChatMessage[] = [
        { id: 'm1', sender: 'agent', text: 'Hello — I am the Reporting AI. Ask me about a session or NPC.', time: new Date().toLocaleTimeString(), charts: [], report: null }
    ];

    draft = '';
    isLoading = false;

    constructor(private api: ApiService) { }

    send() {
        const text = this.draft.trim();
        if (!text) return;
        const now = new Date().toLocaleTimeString();
        const userMsg: ChatMessage = { id: 'u' + Date.now(), sender: 'user', text, time: now };
        this.messages.push(userMsg);
        this.draft = '';
        this.isLoading = true;

        this.api.postReportingAgentChat(text).subscribe({
            next: (res) => {
                const agentMsg: ChatMessage = {
                    id: 'a' + Date.now(),
                    sender: 'agent',
                    text: String(res?.Text ?? res?.text ?? ''),
                    time: new Date().toLocaleTimeString(),
                    charts: (res?.Charts ?? res?.charts ?? []) as ChartDto[],
                    report: res?.Report ? {
                        fileName: res.Report.FileName ?? res.Report.fileName ?? 'report.bin',
                        fileContent: res.Report.FileContent ?? res.Report.fileContent ?? null
                    } : null
                };

                this.messages.push(agentMsg);
                this.isLoading = false;
            },
            error: (err) => {
                const agentMsg: ChatMessage = {
                    id: 'a' + Date.now(),
                    sender: 'agent',
                    text: `Error: ${String(err?.message ?? err)}`,
                    time: new Date().toLocaleTimeString(),
                    charts: [],
                    report: null
                };
                this.messages.push(agentMsg);
                this.isLoading = false;
            }
        });
    }

    downloadReport(report: ReportDto | undefined | null) {
        if (!report || !report.fileContent) return;

        // fileContent may be base64 string or numeric array
        let blob: Blob;
        if (typeof report.fileContent === 'string') {
            // assume base64
            const byteChars = atob(report.fileContent);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray]);
        } else if (Array.isArray(report.fileContent)) {
            const byteArray = new Uint8Array(report.fileContent as number[]);
            blob = new Blob([byteArray]);
        } else {
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.fileName || 'report.bin';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // keep URL available for preview if PDF; otherwise revoke immediately
        if (!(report.fileName || '').toLowerCase().endsWith('.pdf')) {
            URL.revokeObjectURL(url);
        } else {
            // if PDF, set preview URL so user can view inline
            this.pdfPreviewUrl = url;
            this.pdfPreviewName = report.fileName || 'report.pdf';
        }
    }

    pdfPreviewUrl: string | null = null;
    pdfPreviewName: string | null = null;

    previewReport(report: ReportDto | undefined | null) {
        if (!report || !report.fileContent) return;

        // reuse download logic to create blob URL but keep it for preview
        let blob: Blob;
        if (typeof report.fileContent === 'string') {
            const byteChars = atob(report.fileContent as string);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: 'application/pdf' });
        } else if (Array.isArray(report.fileContent)) {
            const byteArray = new Uint8Array(report.fileContent as number[]);
            blob = new Blob([byteArray], { type: 'application/pdf' });
        } else {
            return;
        }

        const url = URL.createObjectURL(blob);
        // revoke previous preview if exists
        if (this.pdfPreviewUrl) {
            URL.revokeObjectURL(this.pdfPreviewUrl);
        }
        this.pdfPreviewUrl = url;
        this.pdfPreviewName = report.fileName || 'report.pdf';
    }

    closePdfPreview() {
        if (this.pdfPreviewUrl) {
            URL.revokeObjectURL(this.pdfPreviewUrl);
        }
        this.pdfPreviewUrl = null;
        this.pdfPreviewName = null;
    }

    computePolylinePoints(c: ChartDto): string {
        if (!c || !c.values || c.values.length === 0) return '';
        const max = Math.max(...c.values);
        const points = c.values.map((v, i) => {
            const denom = (c.values.length - 1) || 1;
            const x = (i / denom) * 100;
            const y = 20 - (v / (max || 1)) * 18;
            return `${x},${y}`;
        });
        return points.join(' ');
    }

    computePercentage(c: ChartDto, i: number): number {
        if (!c || !c.values || c.values.length === 0) return 0;
        const total = c.values.reduce((a, b) => a + b, 0) || 1;
        const pct = (c.values[i] / total) * 100;
        return Math.round(pct);
    }

    computeBarWidth(c: ChartDto, i: number): number {
        if (!c || !c.values || c.values.length === 0) return 0;
        const max = Math.max(...c.values, 1);
        const val = Number(c.values[i] ?? 0);
        const pct = (val / (max || 1)) * 100;
        return Math.round(pct);
    }
}
