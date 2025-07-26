/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { request } from "express";
import { Document, FilterQuery, UpdateQuery } from "mongoose";
import { CrudModelI, CustomMessageI, PopulateFieldI } from "./interface.crud";
declare class CrudService {
    /**
     * The `create` function creates a document in a MongoDB collection.
     * It takes in a `CrudModelI` object, the data to be created, and a filter to check for existing documents.
     * It returns a Promise that resolves to a response message containing the successfully created document.
     *
     * @param {Object} param - An object containing the `modelData`, `data`, and `check` properties.
     * @param {CrudModelI<T>} param.modelData - A `CrudModelI` object representing the MongoDB collection.
     * @param {T} param.data - The data to be created.
     * @param {FilterQuery<T & Document>} param.check - A filter to check for existing documents.
     * @returns {Promise<any>} A Promise that resolves to a response message containing the successfully created document.
     */
    static create<T>({ check, modelData, data, }: {
        modelData: CrudModelI<T>;
        data: T;
        check: FilterQuery<T & Document>;
    }): Promise<CustomMessageI<T & Document>>;
    /**
     * The function `createMany` creates multiple documents in a MongoDB collection based on an array of data.
     * It takes in a `CrudModelI` object, an array of data, and an array of filters to check for existing documents.
     * It returns a Promise that resolves to a response message containing the successfully created documents.
     *
     * @param {Object} param - An object containing the `modelData`, `data`, and `check` properties.
     * @param {CrudModelI<T>} param.modelData - A `CrudModelI` object representing the model to be created.
     * @param {T[]} param.data - An array of data to be created.
     * @param {FilterQuery<T & Document>[]} param.check - An array of filters to check for existing documents.
     * @returns {Promise<any>} A Promise that resolves to a response message containing the successfully created documents.
     */
    static createMany<T>({ check, data, modelData, }: {
        modelData: CrudModelI<T>;
        data: T[];
        check: Partial<FilterQuery<T & Document>>[];
    }): Promise<CustomMessageI<(T & Document)[]>>;
    /**
     * The `update` static method is used to update a document in a database based on specified criteria.
     *
     * @param {Object} params - The `params` object contains the necessary parameters for the update operation.
     * @param {CrudModelI<T>} params.modelData - The `modelData` parameter represents the model(s) to update.
     * @param {UpdateQuery<T>} params.data - The `data` parameter represents the update data.
     * @param {FilterQuery<T & Document>} params.filter - The `filter` parameter represents the criteria to
     * identify the document(s) to update.
     * @returns {Promise<any>} The method returns a promise that resolves to a response message containing the
     * updated document and a success status.
     */
    static update<T>({ data, filter, modelData, }: {
        modelData: CrudModelI<T>;
        data: UpdateQuery<T>;
        filter: FilterQuery<T & Document>;
    }): Promise<CustomMessageI<T & Document>>;
    /**
     * This function retrieves multiple documents from a MongoDB collection based on the provided
     * filter, model, populate, and query parameters.
     * @param {Object} params - The `params` object contains the necessary parameters for the getMany
     * operation.
     * @param {CrudModelI<T>} params.modelData - The `modelData` parameter represents the model(s) to
     * retrieve documents from.
     * @param {FilterQuery<T> | null} params.filter - The `filter` parameter represents the criteria to
     * identify the documents to retrieve.
     * @param {PopulateFieldI<T> | PopulateFieldI<T>[]} params.populate - The `populate` parameter
     * represents the fields to populate in the retrieved documents.
     * @param {typeof request.query} params.query - The `query` parameter represents the query parameters
     * from the request.
     * @returns {Promise<any>} The method returns a promise that resolves to a response message object
     * containing the retrieved documents, a success status, and other relevant information.
     */
    static getMany<T>({ filter, modelData, populate, query, }: {
        modelData: CrudModelI<T>;
        query: typeof request.query;
        populate: PopulateFieldI<T> | PopulateFieldI<T>[];
        filter: FilterQuery<T> | null;
    }): Promise<CustomMessageI<(T & Document)[]>>;
    private static getModelLength;
    /**
     * The function `populateModel` populates a model with specified fields and nested fields based on
     * the provided criteria.
     * @param {any} modelFind - The `modelFind` parameter is the model object that you want to populate
     * with additional data. It could be a Mongoose model instance or any other object that supports
     * population of fields.
     * @param {PopulateFieldI<T> | PopulateFieldI<T>[]} populate - The `populate` parameter in the
     * `populateModel` function is used to specify which fields in the model should be populated with
     * additional data. It can be a single `PopulateFieldI` object or an array of `PopulateFieldI`
     * objects. Each `PopulateFieldI` object
     * @returns The `populateModel` function returns the result of populating the specified fields in the
     * modelFind object based on the populate configuration provided.
     */
    private static populateModel;
    /**
     * The function `delete` is an asynchronous static method in TypeScript that deletes data based on
     * the provided filter query and model data, handling errors and returning a success message.
     * @param  - The `delete` method you provided is an asynchronous function that deletes data from a
     * database using the given `modelData` and `data` parameters. Here's a breakdown of the parameters:
     * @returns The `delete` method is returning a Promise that resolves to an object with the following
     * properties:
     * - `success`: a boolean value indicating the success status of the deletion operation
     * - `message`: a string message indicating that the deletion was successful
     * - `data`: a string value indicating that the data was deleted
     */
    static delete<T>({ data, modelData, }: {
        modelData: CrudModelI<T>;
        data: FilterQuery<T>;
    }): Promise<CustomMessageI<string>>;
    /**
     * This TypeScript function deletes multiple documents based on a filter query using the deleteMany
     * method and returns a success message.
     * @param  - The `deleteMany` function takes in two parameters:
     * @returns The `deleteMany` function returns a Promise that resolves to an object with the following
     * properties:
     * - `success`: a boolean indicating the success status of the deletion operation (true in
     * this case)
     * - `message`: a string message indicating that the deletion was successful ("Deleted successfully"
     * in this case)
     * - `data`: a string value indicating that the data was deleted ("deleted" in this case
     */
    static deleteMany<T>({ data, modelData, }: {
        modelData: CrudModelI<T>;
        data: FilterQuery<T>;
    }): Promise<CustomMessageI<string>>;
    /**
     * Asynchronously retrieves a single document from a MongoDB collection.
     *
     * @param {Object} params - The parameters for retrieving the document.
     * @param {CrudModelI<T>} params.modelData - The model data for the MongoDB collection.
     * @param {FilterQuery<T>} params.data - The filter query for finding the document.
     * @param {PopulateFieldI<T> | PopulateFieldI<T>[]} params.populate - The populate options for the document.
     * @returns {Promise<any>} The response message containing the retrieved document.
     * @throws {CustomError} If the document is not found.
     */
    static getOne<T>({ modelData, data, populate, }: {
        modelData: CrudModelI<T>;
        data: FilterQuery<T>;
        populate: PopulateFieldI<T> | PopulateFieldI<T>[];
    }): Promise<CustomMessageI<T & Document>>;
}
export default CrudService;
