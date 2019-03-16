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
    public class RatingsController : BaseApiController
    {
        private readonly IRatingsService _ratingsService;
        private readonly IAuthenticationService<int> _authService;

        public RatingsController(IRatingsService ratingsService, IAuthenticationService<int> authService
        , ILogger<RatingsController> logger) : base(logger)
        {
            _ratingsService = ratingsService;
            _authService = authService;
        }

        [HttpPost("new")]
        public ActionResult<ItemResponse<int>> Insert(ratingAddRequest req)
        {

            ActionResult result = null;
            int createdBy = _authService.GetCurrentUserId();

            try
            {
                int newId = _ratingsService.Insert(req, createdBy);
                ItemResponse<int> resp = new ItemResponse<int>();
                resp.Item = newId;
                result = Created201(resp);

            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet]
        public ActionResult<ItemResponse<RatingModel>> GetAll()
        {
            ActionResult result = null;
            try
            {
                List<RatingModel> ratingList = _ratingsService.GetAll();


                if (ratingList == null)
                {
                    result = NotFound404(new ErrorResponse("The rating list is empty."));
                }
                else
                {
                    ItemsResponse<RatingModel> resp = new ItemsResponse<RatingModel>();
                    resp.Items = ratingList;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("products/consumer")]
        public ActionResult<ItemsResponse<AverageProductRating>> GetConsumerProductRatings()
        {
            ActionResult result = null;
            try
            {

                List<AverageProductRating> ratingList = _ratingsService.GetAvgConsumerProductRatings();



                if (ratingList == null)
                {
                    result = NotFound404(new ErrorResponse("The product rating list is empty."));
                }
                else
                {
                    ItemsResponse<AverageProductRating> resp = new ItemsResponse<AverageProductRating>();
                    resp.Items = ratingList;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("products/merchant/")]
        public ActionResult<ItemsResponse<AverageProductRating>> GetMerchantProductRatings()
        {
            ActionResult result = null;
            int createdBy = _authService.GetCurrentUserId();

            try
            {
                List<AverageProductRating> ratingList = _ratingsService.GetAvgMerchantProductRatings(createdBy);

                if (ratingList == null)
                {
                    result = NotFound404(new ErrorResponse("You do not have any product ratings to display"));
                }
                else
                {
                    ItemsResponse<AverageProductRating> resp = new ItemsResponse<AverageProductRating>();
                    resp.Items = ratingList;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("merchants")]
        public ActionResult<ItemsResponse<AverageMerchantRating>> GetAvgMerchantRatings()
        {
            ActionResult result = null;
            try
            {
                List<AverageMerchantRating> ratingList = _ratingsService.GetAvgMerchantRatings();

                if (ratingList == null)
                {
                    result = NotFound404(new ErrorResponse("You do not have any merchant ratings to display"));
                }
                else
                {
                    ItemsResponse<AverageMerchantRating> resp = new ItemsResponse<AverageMerchantRating>();
                    resp.Items = ratingList;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("products/consumer/{entityId}")]
        public ActionResult<ItemResponse<AverageProductRating>> GetConsumerProductRatingByEntityId(int entityId)
        {
            ActionResult result = null;
            try
            {
                AverageProductRating rating = _ratingsService.GetAvgConsumerProductRatingByEntityId(entityId);

                if (rating == null)
                {
                    result = NotFound404(new ErrorResponse("You do not have any product ratings to display"));
                }
                else
                {
                    ItemResponse<AverageProductRating> resp = new ItemResponse<AverageProductRating>();
                    resp.Item = rating;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("merchants/current")]
        public ActionResult<ItemResponse<AverageMerchantRating>> GetCurrentMerchantRating()
        {
            ActionResult result = null;

            int merchant = _authService.GetCurrentUserId();
            AverageMerchantRating rating = _ratingsService.GetAvgMerchantRatingByMerchant(merchant);
            try
            {
                if (rating == null)
                {
                    result = NotFound404(new ErrorResponse("There is merchant that matches " + merchant + " in our database."));
                }
                else
                {

                    ItemResponse<AverageMerchantRating> resp = new ItemResponse<AverageMerchantRating>();
                    resp.Item = rating;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpGet("merchants/{merchant}")]
        public ActionResult<ItemResponse<AverageMerchantRating>> GetAvgMerchantRatingByMerchant(int merchant)
        {
            ActionResult result = null;

            AverageMerchantRating rating = _ratingsService.GetAvgMerchantRatingByMerchant(merchant);
            try
            {
                if (rating == null)
                {
                    result = NotFound404(new ErrorResponse("There is merchant that matches " + merchant + " in our database."));
                }
                else
                {

                    ItemResponse<AverageMerchantRating> resp = new ItemResponse<AverageMerchantRating>();
                    resp.Item = rating;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }
        [HttpGet("{id}")]
        public ActionResult<ItemResponse<RatingModel>> GetById(int id)
        {
            ActionResult result = null;

            RatingModel rating = _ratingsService.GetById(id);

            try
            {
                if (rating == null)
                {
                    result = NotFound404(new ErrorResponse("There is no id that matches " + id + " in our database."));
                }
                else
                {

                    ItemResponse<RatingModel> resp = new ItemResponse<RatingModel>();
                    resp.Item = rating;
                    result = Ok200(resp);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }

            return result;
        }

        [HttpPut("{id}/edit")]
        public ActionResult<SuccessResponse> Update(ProductRatingUpdateRequest req)
        {
            ActionResult result = null;


            try
            {
                int modifiedBy = _authService.GetCurrentUserId();
                _ratingsService.Update(req);
                SuccessResponse resp = new SuccessResponse();
                result = Ok200(resp);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;
        }

        [HttpDelete("{id}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ActionResult result = null;
            try
            {
                _ratingsService.Delete(id);
                SuccessResponse resp = new SuccessResponse();
                result = Ok200(resp);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;
        }
    }
}

