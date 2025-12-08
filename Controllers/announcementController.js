
import Announcement from '../Models/AnnouncementModel.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';

// @desc      Get all announcements
// @route     GET /api/v1/announcements
// @access    Private
const getAnnouncements = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single announcement
// @route     GET /api/v1/announcements/:id
// @access    Private
const getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id).populate('author', 'firstName lastName');

  if (!announcement) {
    return next(
      new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: announcement });
});

// @desc      Create announcement
// @route     POST /api/v1/announcements
// @access    Private/Admin
const createAnnouncement = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  
  const announcement = await Announcement.create(req.body);

  res.status(201).json({
    success: true,
    data: announcement,
  });
});

// @desc      Update announcement
// @route     PUT /api/v1/announcements/:id
// @access    Private/Admin
const updateAnnouncement = asyncHandler(async (req, res, next) => {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return next(
          new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
        );
    }
    
    // Make sure user is the author
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'Admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this announcement`, 401)
          );
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

  res.status(200).json({ success: true, data: announcement });
});

// @desc      Delete announcement
// @route     DELETE /api/v1/announcements/:id
// @access    Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return next(
          new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is the author
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'Admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete this announcement`, 401)
          );
    }

    await announcement.remove();

    res.status(200).json({ success: true, data: {} });
});


export {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
