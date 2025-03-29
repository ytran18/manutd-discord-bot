const getTimestamp = (): string => {
    return new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false
    });
};

class Logger {
    info(context: string, message: string): void {
        console.log(`[${getTimestamp()}] 📘 INFO [${context}]: ${message}`);
    }

    success(context: string, message: string): void {
        console.log(`[${getTimestamp()}] ✅ SUCCESS [${context}]: ${message}`);
    }

    warn(context: string, message: string): void {
        console.warn(`[${getTimestamp()}] ⚠️ WARNING [${context}]: ${message}`);
    }

    error(context: string, message: string, error?: unknown): void {
        console.error(`[${getTimestamp()}] ❌ ERROR [${context}]: ${message}`);
        if (error) {
            if (error instanceof Error) {
                console.error(`Stack trace: ${error.stack}`);
            } else {
                console.error('Additional error details:', error);
            }
        }
    }

    debug(context: string, message: string, data?: unknown): void {
        console.debug(`[${getTimestamp()}] 🔍 DEBUG [${context}]: ${message}`);
        if (data) {
            console.debug('Debug data:', data);
        }
    }
}

export default new Logger();