using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Category { get; set; }
            public DateTime? Date { get; set; }
            public string City { get; set; }
            public string Venue { get; set; }       
        }
        
        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Unit> Handle(Command request, 
                                    CancellationToken cancellationToken)
            {
                var activitiy = await _context.Activities.FindAsync(request.Id);

                if(activitiy == null) 
                    throw new Exception("Could not find the activity");

                activitiy.Title = request.Title ?? activitiy.Title;
                activitiy.Description = request.Description ?? activitiy.Description;
                activitiy.Category = request.Category ?? activitiy.Category;
                activitiy.Date = request.Date ?? activitiy.Date;
                activitiy.City = request.City ?? activitiy.City;
                activitiy.Venue = request.Venue ?? activitiy.Venue;

                var success = await _context.SaveChangesAsync() > 0;

                if(success) return Unit.Value;

                throw new Exception("Problem saving changes.");
            }
        }
    }
}