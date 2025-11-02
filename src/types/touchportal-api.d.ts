declare module "touchportal-api" {
    interface ClientOptions {
        pluginId?: string;
        host?: string;
        port?: number;
        debug?: boolean;
    }

    interface ConnectOptions {
        pluginId?: string;
        updateUrl?: string;
    }

    interface NotifyAction {
        id: string;
        title: string;
    }

    interface EventData {

    }

    class Client {
        constructor(options?: ClientOptions);
        connect(options?: ConnectOptions): Promise<void> | void;
        on(event: string, handler: (...args: any[]) => void): void;
        logIt(level: "INFO" | "WARN" | "ERROR" | "DEBUG", message: string, ...args: any[]): void;
        sendNotification(id: string, title: string, message: string, actions: NotifyAction[]);
        stateUpdate(stateId: string, value: any);
    }

    const TouchPortalAPI: {
        Client: typeof Client;
    };

    export default TouchPortalAPI;
    export { Client, ClientOptions };
}