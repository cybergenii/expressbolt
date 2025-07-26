var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import httpStatus from "http-status";
import CustomError from "./error.handler";
import Queries from "./query";
import responseMessage from "./responseMessage";
class CrudService {
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
    static create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ check, modelData, data, }) {
            const find = Object.keys(check).length !== 0
                ? yield modelData.Model.findOne(check)
                : null;
            if (find) {
                throw new CustomError(httpStatus.BAD_REQUEST, `the data for:  ${JSON.stringify(Object.keys(check).join(", "))} already exists in the database`);
            }
            const create = new modelData.Model(data);
            const created = yield create.save();
            if (!created) {
                throw new CustomError(httpStatus.BAD_REQUEST, `${modelData.Model.collection.collectionName} is not successfully created`);
            }
            const dat = yield modelData.Model.findById(created._id).select(modelData.select.join(" "));
            return responseMessage({
                success: true,
                data: dat,
                message: "Successfully created",
            });
        });
    }
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
    static createMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ check, data, modelData, }) {
            if (check) {
                const checks = check.map((findr) => {
                    return Object.keys(findr).length !== 0
                        ? modelData.Model.findOne(findr)
                        : null;
                });
                const finds = yield Promise.all(checks);
                finds.forEach((find, index) => {
                    if (find) {
                        throw new CustomError(httpStatus.BAD_REQUEST, `the data ${JSON.stringify(Object.keys(check[index]).join(", "))} already exists in the database`);
                    }
                });
            }
            const created = yield modelData.Model.insertMany(data);
            if (!created) {
                throw new CustomError(httpStatus.BAD_REQUEST, `${modelData.Model.collection.collectionName} is not successfully created`);
            }
            const selectedData = yield Promise.all(created.map((item) => modelData.Model.findById(item._id).select(modelData.select.join(" "))));
            return responseMessage({
                success: true,
                data: selectedData,
                message: "Successfully created",
            });
        });
    }
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
    static update(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, filter, modelData, }) {
            const dataF = [];
            const findAndUpdate = modelData.select.length > 0
                ? yield modelData.Model.findOneAndUpdate(filter, data).select(modelData.select.join(" "))
                : yield modelData.Model.findOneAndUpdate(filter, data);
            if (!findAndUpdate) {
                throw new CustomError(httpStatus.BAD_REQUEST, `{modelData.Model.collection.collectionName} not updated successfully`);
            }
            else {
                dataF.push(findAndUpdate);
            }
            return responseMessage({
                success: true,
                data: dataF[0],
                message: "Successfully updated",
            });
        });
    }
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
    static getMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filter, modelData, populate, query, }) {
            const all = [];
            const processModel = (model) => __awaiter(this, void 0, void 0, function* () {
                let modelFind = filter ? model.Model.find(filter) : model.Model.find();
                if (model.select) {
                    modelFind = modelFind.select(model.select.join(" "));
                }
                if (populate) {
                    modelFind = CrudService.populateModel(modelFind, populate);
                }
                const queryf = new Queries(modelFind, query)
                    .filter()
                    .limitFields()
                    .paginate()
                    .sort();
                const queryG = yield queryf.model;
                if (!queryG) {
                    throw new CustomError(httpStatus.NOT_FOUND, `${model} is not fetched`);
                }
                all.push(queryG);
            });
            // if (Array.isArray(modelData)) {
            //   await Promise.all(modelData.map(processModel));
            // } else {
            yield processModel(modelData);
            return responseMessage({
                success: true,
                message: "Data fetched successfully",
                data: all[0],
                doc_length: yield CrudService.getModelLength(modelData, filter),
            });
        });
    }
    static getModelLength(model, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield model.Model.countDocuments(filter || {});
            return count;
        });
    }
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
    static populateModel(modelFind, populate) {
        if (!populate) {
            return modelFind;
        }
        const populateArr = Array.isArray(populate) ? populate : [populate];
        return populateArr.reduce((model, pop) => {
            var _a;
            if (!pop.path) {
                return model;
            }
            return model.populate({
                path: pop.path,
                select: (_a = pop.fields) === null || _a === void 0 ? void 0 : _a.join(" "),
                populate: pop.second_layer_populate,
            });
        }, modelFind);
    }
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
    static delete(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, modelData, }) {
            // if (Array.isArray(modelData)) {
            //   Promise.all(
            //     modelData.map(async (model) => {
            //       const delet = await model.Model.deleteOne(data);
            //       if (!delet) {
            //         throw new CustomError (
            //           httpStatus.NOT_IMPLEMENTED,
            //           `${model} is not successfully deleted`
            //         );
            //       }
            //     })
            //   );
            // } else {
            const delet = yield modelData.Model.deleteOne(data);
            if (!delet) {
                throw new CustomError(httpStatus.NOT_FOUND, `{modelData.Model.collection.collectionName} is not successfully deleted`);
                // }
            }
            return responseMessage({
                success: true,
                message: "Deleted successfully",
                data: "deleted",
            });
        });
    }
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
    static deleteMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, modelData, }) {
            // if (Array.isArray(modelData)) {
            //   Promise.all(
            //     modelData.map(async (model) => {
            //       const delet = await model.Model.deleteOne(data);
            //       if (!delet) {
            //         throw new CustomError (
            //           httpStatus.NOT_IMPLEMENTED,
            //           `${model} is not successfully deleted`
            //         );
            //       }
            //     })
            //   );
            // } else {
            const delet = yield modelData.Model.deleteMany(data);
            if (!delet) {
                throw new CustomError(httpStatus.NOT_FOUND, `${modelData.Model.collection.collectionName} is not successfully deleted`);
                // }
            }
            return responseMessage({
                success: true,
                message: "Deleted successfully",
                data: "deleted",
            });
        });
    }
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
    static getOne(_a) {
        return __awaiter(this, arguments, void 0, function* ({ modelData, data, populate, }) {
            // const response = await CrudService.
            const getData = [];
            let getOne;
            getOne = modelData.Model.findOne(data).select(modelData.select.join(" "));
            if (!getOne)
                throw new CustomError(httpStatus.NOT_FOUND, `{modelData.Model.collection.collectionName} is not successfully fetched`);
            if (populate)
                getOne = CrudService.populateModel(getOne, populate);
            const gotten = yield getOne.exec();
            getData.push(gotten);
            return responseMessage({
                success: true,
                message: " fetched successfully",
                data: getData[0],
            });
        });
    }
}
export default CrudService;
//# sourceMappingURL=crud.service.js.map