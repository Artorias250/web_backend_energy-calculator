"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceSerializer = exports.ApplianceResponse = void 0;
const media_url_1 = require("../../common/media-url");
class ApplianceResponse {
    id;
    applianceName;
    description;
    publicationStatus;
    powerWatts;
    minTemperature;
    imageFileName;
    videoFileName;
    imageUrl;
    videoUrl;
    likesCount;
    isOwner;
    isLiked;
    createdAt;
    formattedAt;
}
exports.ApplianceResponse = ApplianceResponse;
class ApplianceSerializer {
    static toResponse(appliance, currentUserId) {
        const likes = appliance.likes || [];
        return {
            id: appliance.applianceId,
            applianceName: appliance.applianceName,
            description: appliance.applianceDescription,
            publicationStatus: appliance.publicationStatus,
            powerWatts: appliance.powerWatts,
            minTemperature: appliance.minTemperature,
            imageFileName: appliance.imageUrl,
            videoFileName: appliance.videoUrl,
            imageUrl: (0, media_url_1.resolveMediaUrl)(appliance.imageUrl, 'image'),
            videoUrl: (0, media_url_1.resolveMediaUrl)(appliance.videoUrl, 'video'),
            likesCount: likes.length,
            isOwner: appliance.creatorId === currentUserId ? 1 : 0,
            isLiked: likes.some((like) => like.userId === currentUserId) ? 1 : 0,
            createdAt: appliance.createdAt,
            formattedAt: appliance.formattedAt,
        };
    }
}
exports.ApplianceSerializer = ApplianceSerializer;
//# sourceMappingURL=appliance.serializer.js.map