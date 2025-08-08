using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sabio.Web.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/ratings")]
    [ApiController]
    public class RatingsController : BaseApiController
    {
        private readonly IRatingsService _ratingsService;
        private readonly IAuthenticationService<int> _authService;

        public RatingsController(
            IRatingsService ratingsService, 
            IAuthenticationService<int> authService,
            ILogger<RatingsController> logger) : base(logger)
        {
            _ratingsService = ratingsService ?? throw new ArgumentNullException(nameof(ratingsService));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }

        [HttpPost("new")]
        public async Task<ActionResult<ItemResponse<int>>> InsertAsync(ratingAddRequest req)
        {
            if (req == null)
            {
                return BadRequest(new ErrorResponse("Request cannot be null"));
            }

            try
            {
                int createdBy = _authService.GetCurrentUserId();
                int newId = await _ratingsService.InsertAsync(req, createdBy);
                
                return CreatedAtAction(nameof(GetById), new { id = newId }, new ItemResponse<int> { Item = newId });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error inserting rating");
                return StatusCode(500, new ErrorResponse("An error occurred while creating the rating"));
            }
        }

        [HttpGet]
        public async Task<ActionResult<ItemsResponse<RatingModel>>> GetAllAsync()
        {
            try
            {
                var ratingList = await _ratingsService.GetAllAsync();

                if (ratingList == null || !ratingList.Any())
                {
                    return NotFound(new ErrorResponse("No ratings found"));
                }

                return Ok(new ItemsResponse<RatingModel> { Items = ratingList });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving ratings");
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving ratings"));
            }
        }

        [HttpGet("products/consumer")]
        public async Task<ActionResult<ItemsResponse<AverageProductRating>>> GetConsumerProductRatingsAsync()
        {
            try
            {
                var ratingList = await _ratingsService.GetAvgConsumerProductRatingsAsync();

                if (ratingList == null || !ratingList.Any())
                {
                    return NotFound(new ErrorResponse("No consumer product ratings found"));
                }

                return Ok(new ItemsResponse<AverageProductRating> { Items = ratingList });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving consumer product ratings");
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving consumer product ratings"));
            }
        }

        [HttpGet("products/merchant")]
        public async Task<ActionResult<ItemsResponse<AverageProductRating>>> GetMerchantProductRatingsAsync()
        {
            try
            {
                int createdBy = _authService.GetCurrentUserId();
                var ratingList = await _ratingsService.GetAvgMerchantProductRatingsAsync(createdBy);

                if (ratingList == null || !ratingList.Any())
                {
                    return NotFound(new ErrorResponse("No merchant product ratings found for your account"));
                }

                return Ok(new ItemsResponse<AverageProductRating> { Items = ratingList });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving merchant product ratings");
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving merchant product ratings"));
            }
        }

        [HttpGet("merchants")]
        public async Task<ActionResult<ItemsResponse<AverageMerchantRating>>> GetAvgMerchantRatingsAsync()
        {
            try
            {
                var ratingList = await _ratingsService.GetAvgMerchantRatingsAsync();

                if (ratingList == null || !ratingList.Any())
                {
                    return NotFound(new ErrorResponse("No merchant ratings found"));
                }

                return Ok(new ItemsResponse<AverageMerchantRating> { Items = ratingList });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving merchant ratings");
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving merchant ratings"));
            }
        }

        [HttpGet("products/consumer/{entityId:int}")]
        public async Task<ActionResult<ItemResponse<AverageProductRating>>> GetConsumerProductRatingByEntityIdAsync(int entityId)
        {
            if (entityId <= 0)
            {
                return BadRequest(new ErrorResponse("Invalid entity ID"));
            }

            try
            {
                var rating = await _ratingsService.GetAvgConsumerProductRatingByEntityIdAsync(entityId);

                if (rating == null)
                {
                    return NotFound(new ErrorResponse($"No product rating found for entity ID {entityId}"));
                }

                return Ok(new ItemResponse<AverageProductRating> { Item = rating });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving consumer product rating for entity {EntityId}", entityId);
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving the product rating"));
            }
        }

        [HttpGet("merchants/current")]
        public async Task<ActionResult<ItemResponse<AverageMerchantRating>>> GetCurrentMerchantRatingAsync()
        {
            try
            {
                int merchantId = _authService.GetCurrentUserId();
                var rating = await _ratingsService.GetAvgMerchantRatingByMerchantAsync(merchantId);

                if (rating == null)
                {
                    return NotFound(new ErrorResponse($"No merchant rating found for merchant ID {merchantId}"));
                }

                return Ok(new ItemResponse<AverageMerchantRating> { Item = rating });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving current merchant rating");
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving the merchant rating"));
            }
        }

        [HttpGet("merchants/{merchantId:int}")]
        public async Task<ActionResult<ItemResponse<AverageMerchantRating>>> GetAvgMerchantRatingByMerchantAsync(int merchantId)
        {
            if (merchantId <= 0)
            {
                return BadRequest(new ErrorResponse("Invalid merchant ID"));
            }

            try
            {
                var rating = await _ratingsService.GetAvgMerchantRatingByMerchantAsync(merchantId);

                if (rating == null)
                {
                    return NotFound(new ErrorResponse($"No merchant rating found for merchant ID {merchantId}"));
                }

                return Ok(new ItemResponse<AverageMerchantRating> { Item = rating });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving merchant rating for merchant {MerchantId}", merchantId);
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving the merchant rating"));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ItemResponse<RatingModel>>> GetByIdAsync(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new ErrorResponse("Invalid rating ID"));
            }

            try
            {
                var rating = await _ratingsService.GetByIdAsync(id);

                if (rating == null)
                {
                    return NotFound(new ErrorResponse($"No rating found with ID {id}"));
                }

                return Ok(new ItemResponse<RatingModel> { Item = rating });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error retrieving rating with ID {RatingId}", id);
                return StatusCode(500, new ErrorResponse("An error occurred while retrieving the rating"));
            }
        }

        [HttpPut("{id:int}/edit")]
        public async Task<ActionResult<SuccessResponse>> UpdateAsync(int id, ProductRatingUpdateRequest req)
        {
            if (req == null)
            {
                return BadRequest(new ErrorResponse("Request cannot be null"));
            }

            if (id <= 0)
            {
                return BadRequest(new ErrorResponse("Invalid rating ID"));
            }

            try
            {
                int modifiedBy = _authService.GetCurrentUserId();
                await _ratingsService.UpdateAsync(req);
                
                return Ok(new SuccessResponse());
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating rating with ID {RatingId}", id);
                return StatusCode(500, new ErrorResponse("An error occurred while updating the rating"));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<SuccessResponse>> DeleteAsync(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new ErrorResponse("Invalid rating ID"));
            }

            try
            {
                await _ratingsService.DeleteAsync(id);
                return Ok(new SuccessResponse());
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting rating with ID {RatingId}", id);
                return StatusCode(500, new ErrorResponse("An error occurred while deleting the rating"));
            }
        }
    }
}

