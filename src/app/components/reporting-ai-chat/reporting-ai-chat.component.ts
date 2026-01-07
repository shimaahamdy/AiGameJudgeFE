import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

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
    summary?: string;
}

@Component({
    selector: 'app-reporting-ai-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reporting-ai-chat.component.html',
    styleUrls: ['./reporting-ai-chat.component.css']
})
export class ReportingAIChatComponent implements OnInit {
    messages: ChatMessage[] = [];
    @ViewChild('chatWindow') chatWindow!: ElementRef<HTMLDivElement>;

    // pagination / load more
    currentPage = 1;
    pageSize = 2;
    hasMore = true;

    draft = '';
    isLoading = false;
    isLoadingMore = false;


    // auth / login state
    authUsername = '';
    authPassword = '';
    authMessage: string | null = null;
    token: string | null = null;
    isLoggedIn = false;

    constructor(private api: ApiService, private auth: AuthService) {
        const stored = this.auth.getToken();
        if (stored) {
            this.token = stored;
            this.isLoggedIn = true;
        }
        this.auth.token$.subscribe((t) => {
            this.token = t;
            this.isLoggedIn = !!t;
        });
    }

    // Map backend DeveloperMessageWithResponseDto to ChatMessage
    private mapApiItemToChatMessage(item: any, id: string): ChatMessage {
        const role = (item?.Role ?? item?.role ?? 'agent').toLowerCase();
        const sender: 'user' | 'agent' = role === 'agent' ? 'agent' : 'user';

        let messageText = '';
        let charts: ChartDto[] = [];
        let report: ReportDto | null = null;
        let summary = '';

        if (role === 'agent' && (item?.Response || item?.response)) {
            const response = item.Response ?? item.response;
            messageText = String(response?.text ?? response?.Text ?? response?.message ?? response?.Message ?? '');
            summary = String(response?.summary ?? response?.Summary ?? '');
            charts = (response?.charts ?? response?.Charts ?? []) as ChartDto[];
            if (response?.report ?? response?.Report) {
                const r = response?.report ?? response?.Report;
                report = {
                    fileName: r?.fileName ?? r?.FileName ?? 'report.bin',
                    fileContent: r?.fileContent ?? r?.FileContent ?? null
                };
            }
        } else {
            messageText = String(item?.MessageText ?? item?.messageText ?? item?.Message ?? item?.message ?? '');
        }

        return {
            id: id,
            sender,
            text: messageText,
            time: item?.Timestamp ? new Date(item.Timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
            charts,
            report,
            summary
        };
    }

    ngOnInit() {
        console.log('ReportingAIChatComponent loaded, fetching initial messages');
        this.loadInitialMessages();
    }

    private scrollToBottom(delay = 0) {
        setTimeout(() => {
            try {
                const el = this.chatWindow?.nativeElement;
                if (el) el.scrollTop = el.scrollHeight;
            } catch (e) { }
        }, delay);
    }

    // Load initial messages when component loads
    loadInitialMessages() {
        this.isLoadingMore = true;
        this.currentPage = 1;
        this.hasMore = true;

        this.api.fetchPreviousMessages(1, this.pageSize).subscribe({
            next: (res) => {
                console.log('Initial messages loaded:', res);
                // API returns newest-first; map then reverse to chronological order (oldest -> newest)
                const mapped: ChatMessage[] = (res || []).map((item: any, idx: number) => this.mapApiItemToChatMessage(item, `msg-init-${idx}`));
                const loadedMessages = mapped.reverse();

                // Set messages to loaded messages, or show welcome if none
                this.messages = loadedMessages.length > 0 ? loadedMessages : [
                    { id: 'm1', sender: 'agent', text: 'Hello — I am the Reporting AI. Ask me about a session or NPC.', time: new Date().toLocaleTimeString(), charts: [], report: null, summary: '' }
                ];

                // scroll to bottom to show latest
                setTimeout(() => {
                    try {
                        const el = this.chatWindow?.nativeElement;
                        if (el) el.scrollTop = el.scrollHeight;
                    } catch (e) { /* ignore */ }
                }, 0);

                // if returned less than pageSize, there's no more
                if (!res || (res as any[]).length < this.pageSize) this.hasMore = false;

                this.isLoadingMore = false;
            },
            error: (err) => {
                console.error('Failed to load initial messages:', err);
                // On error, show welcome message
                this.messages = [
                    { id: 'm1', sender: 'agent', text: 'Hello — I am the Reporting AI. Ask me about a session or NPC.', time: new Date().toLocaleTimeString(), charts: [], report: null, summary: '' }
                ];
                this.isLoadingMore = false;
            }
        });
    }

    send() {
        const text = this.draft.trim();
        console.log('send() called with text:', text);
        if (!text) {
            console.log('Text is empty, returning');
            return;
        }
        const now = new Date().toLocaleTimeString();
        const userMsg: ChatMessage = { id: 'u' + Date.now(), sender: 'user', text, time: now };
        this.messages.push(userMsg);
        this.draft = '';
        this.isLoading = true;
        console.log('Calling API with message:', text);

        this.api.postReportingAgentChat(text).subscribe({
            next: (res) => {
                console.log('API response received:', res);
                let responseText = '';
                let summary = '';
                if (typeof res === 'object' && res !== null) {
                    // Try different case variations
                    responseText = String(res?.text ?? res?.Text ?? res?.message ?? res?.Message ?? '');
                    summary = String(res?.summary ?? res?.Summary ?? '');
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
                    } : null,
                    summary: summary
                };

                this.messages.push(agentMsg);
                this.isLoading = false;
                this.scrollToBottom(50);
            },
            error: (err) => {
                console.error('API error:', err);
                const agentMsg: ChatMessage = {
                    id: 'a' + Date.now(),
                    sender: 'agent',
                    text: `Error: ${String(err?.message ?? err)}`,
                    time: new Date().toLocaleTimeString(),
                    charts: [],
                    report: null,
                    summary: ''
                };
                this.messages.push(agentMsg);
                this.isLoading = false;
                this.scrollToBottom(50);
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
                    this.auth.setToken(this.token);
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
        this.auth.clear();
        this.authMessage = 'Logged out.';
    }

    // Load previous messages when scrolling to the top
    onScroll(event: Event) {
        const div = event.target as HTMLDivElement;
        if (div.scrollTop <= 40 && !this.isLoadingMore && this.hasMore) {
            this.loadPreviousMessages();
        }
    }

    // Fetch previous messages from API
    loadPreviousMessages() {
        if (!this.chatWindow) return;

        this.isLoadingMore = true;
        this.currentPage++;
        const el = this.chatWindow.nativeElement;
        const prevScrollHeight = el.scrollHeight;
        const prevScrollTop = el.scrollTop;

        this.api.fetchPreviousMessages(this.currentPage, this.pageSize).subscribe({
            next: (res) => {
                console.log('Previous messages loaded for page', this.currentPage, ':', res);
                // Map and reverse to chronological order for this page
                const mapped: ChatMessage[] = (res || []).map((item: any, idx: number) => this.mapApiItemToChatMessage(item, `msg-page${this.currentPage}-${idx}`));
                const previousMessages = mapped.reverse();

                // Prepend previous messages to the beginning
                this.messages = [...previousMessages, ...this.messages];

                // maintain scroll position so content doesn't jump
                setTimeout(() => {
                    try {
                        const newHeight = el.scrollHeight;
                        // preserve user's visual position: newTop = newHeight - oldHeight + oldTop
                        el.scrollTop = (newHeight - prevScrollHeight) + (prevScrollTop || 0);
                    } catch (e) { /* ignore */ }
                }, 0);

                // if returned less than pageSize, there's no more
                if (!res || (res as any[]).length < this.pageSize) this.hasMore = false;

                this.isLoadingMore = false;
            },
            error: (err) => {
                console.error('Failed to load previous messages:', err);
                this.authMessage = `Failed to load previous messages: ${String(err?.message ?? err)}`;
                this.isLoadingMore = false;
                // Revert page count on error
                this.currentPage--;
            }
        });
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

        // Always revoke URL immediately; don't show preview modal
        URL.revokeObjectURL(url);
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
