import {
	Connection,
	InitializeParams,
	InitializeResult,
} from 'vscode-languageserver'
import { CapabilityCalculator } from './capabilityCalculator'
import DefinitionProvider from './providers/definitionProvider'
import HoverProvider from './providers/hoverProvider'
import CompletionProvider from './providers/completionProvider'
import CompletionResolveProvider from './providers/completionResolveProvider'
import { documents } from './documentManager'
import { forest } from './forest'
import { getNewProjectIndex } from './utils/packagesUtils'

export interface ILanguageServer {
	readonly capabilities: InitializeResult
  initialize(): void
  setup(): void
  shutdown(): void
}

export class Server implements ILanguageServer {
	public connection: Connection
	private calculator: CapabilityCalculator

	constructor(connection: Connection, params: InitializeParams) {
		this.connection = connection
		this.calculator = new CapabilityCalculator(params.capabilities)

		documents.listen(connection)
	}

	get capabilities(): InitializeResult {
		return {
			capabilities: this.calculator.capabilities,
		}
	}

	/**
	 * Initialize should be run during the initialization phase of the client connection
	 */
	public initialize(): void {
		this.registerInitializeProviders()
	}

	/**
	 * Setup should be run after the client connection has been initialized. We can do things here like
	 * handle changes to the workspace and query configuration settings
	 */
	public setup(): void {
		this.registerInitializedProviders()

		getNewProjectIndex()
	}

	public shutdown(): void {
		forest.release()
	}

	// registers providers on the initialize step
	private registerInitializeProviders(): void {
    DefinitionProvider.register(this.connection)
		HoverProvider.register(this.connection)
		CompletionProvider.register(this.connection)
		CompletionResolveProvider.register(this.connection)
	}

	// registers providers on the initialized step
	private registerInitializedProviders(): void {
		// TODO
	}
}
