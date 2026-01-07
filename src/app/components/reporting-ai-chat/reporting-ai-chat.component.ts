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

    // auth / login state
    authUsername = '';
    authPassword = '';
    authMessage: string | null = null;
    token: string | null = null;
    isLoggedIn = false;

    constructor(private api: ApiService) {
        const stored = localStorage.getItem('authToken');
        if (stored) {
            this.token = stored;
            this.isLoggedIn = true;
        }
    }

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
                // Handle multiple response formats for text content
                let responseText = '';
                if (typeof res === 'object' && res !== null) {
                    // Try different case variations
                    responseText = String(res?.text ?? res?.Text ?? res?.message ?? res?.Message ?? '');
                } else {
                    responseText = String(res);
                }

                const agentMsg: ChatMessage = {
                    id: 'a' + Date.now(),
                    sender: 'agent',
                    text: responseText,
                    time: new Date().toLocaleTimeString(),
                    charts: (res?.charts ?? res?.Charts ?? []) as ChartDto[],
                    report: res?.report ?? res?.Report ? {
                        fileName: (res?.report ?? res?.Report)?.fileName ?? (res?.report ?? res?.Report)?.FileName ?? 'report.bin',
                        fileContent: (res?.report ?? res?.Report)?.fileContent ?? (res?.report ?? res?.Report)?.FileContent ?? null
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

    // Register a new user
    register() {
        if (!this.authUsername || !this.authPassword) {
            this.authMessage = 'Username and password are required.';
            return;
        }

        this.api.registerUser(this.authUsername, this.authPassword).subscribe({
            next: () => {
                this.authMessage = 'Registration successful.';
            },
            error: (err) => {
                this.authMessage = String(err?.message ?? err);
            }
        });
    }

    // Login and store token
    login() {
        if (!this.authUsername || !this.authPassword) {
            this.authMessage = 'Username and password are required.';
            return;
        }

        this.api.loginUser(this.authUsername, this.authPassword).subscribe({
            next: (res) => {
                const txt = String(res ?? '');
                const m = txt.match(/token:\s*(.+)/i);
                const token = m ? m[1].trim() : txt.trim();
                if (token) {
                    this.token = token as string;
                    localStorage.setItem('authToken', this.token);
                    this.isLoggedIn = true;
                    this.authMessage = 'Login successful.';
                } else {
                    this.authMessage = 'Login response did not contain a token.';
                }
            },
            error: (err) => {
                this.authMessage = String(err?.message ?? err);
            }
        });
    }

    // Logout and clear stored token
    logout() {
        this.token = null;
        this.isLoggedIn = false;
        localStorage.removeItem('authToken');
        this.authMessage = 'Logged out.';
    }

    downloadReport(report: ReportDto | undefined | null) {
        if (!report || !report.fileContent) return;

        // Determine MIME type based on file extension
        const fileName = report.fileName || 'report.bin';
        const isPdf = fileName.toLowerCase().endsWith('.pdf');
        const mimeType = isPdf ? 'application/pdf' : 'application/octet-stream';

        // Convert fileContent from encoded format (base64 string or numeric array) to Blob
        let blob: Blob;
        if (typeof report.fileContent === 'string') {
            // Base64 encoded string - decode it
            const binaryString = atob(report.fileContent);
            const byteNumbers = new Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                byteNumbers[i] = binaryString.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: mimeType });
        } else if (Array.isArray(report.fileContent)) {
            // Numeric array - convert directly to Uint8Array
            const byteArray = new Uint8Array(report.fileContent as number[]);
            blob = new Blob([byteArray], { type: mimeType });
        } else {
            return;
        }

        // Create download link and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Keep URL for PDF preview; revoke immediately for other file types
        if (isPdf) {
            this.pdfPreviewUrl = url;
            this.pdfPreviewName = fileName;
        } else {
            URL.revokeObjectURL(url);
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
